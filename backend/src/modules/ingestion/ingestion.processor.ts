import { Logger, Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ArticleEntity } from '../articles/article.entity';
import { IocEntity } from '../articles/ioc.entity';
import { SourceEntity } from '../sources/source.entity';
import { SourcesService } from '../sources/sources.service';
import { RssParserService, RssArticle } from './rss-parser.service';
import { LanguageDetectorService } from './language-detector.service';
import { TranslationService } from './translation.service';
import { EnrichmentService } from './enrichment.service';
import { SearchService } from '../search/search.service';
import { ArticlesGateway } from '../articles/articles.gateway';

interface IngestionJob {
    sourceId: string;
}

@Injectable()
export class IngestionProcessor {
    private readonly logger = new Logger(IngestionProcessor.name);

    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepository: Repository<ArticleEntity>,
        @InjectRepository(IocEntity)
        private iocRepository: Repository<IocEntity>,
        @InjectRepository(SourceEntity)
        private sourceRepository: Repository<SourceEntity>,
        private sourcesService: SourcesService,
        private rssParser: RssParserService,
        private languageDetector: LanguageDetectorService,
        private translator: TranslationService,
        private enricher: EnrichmentService,
        private searchService: SearchService,
        private articlesGateway: ArticlesGateway,
    ) { }

    async handleFetchRss(job: { data: IngestionJob } | IngestionJob) {
        const sourceId = 'data' in job ? job.data.sourceId : job.sourceId;
        this.logger.log(`Processing RSS feed for source: ${sourceId}`);

        try {
            // Get source
            const source = await this.sourceRepository.findOne({ where: { id: sourceId } });
            if (!source || !source.enabled) {
                this.logger.warn(`Source ${sourceId} not found or disabled`);
                return;
            }

            // Fetch RSS feed
            const articles = await this.rssParser.fetchFeed(source);
            this.logger.log(`Fetched ${articles.length} articles`);

            // Process each article
            for (const rssArticle of articles) {
                try {
                    await this.processArticle(rssArticle, source);
                } catch (error) {
                    this.logger.error(`Error processing article: ${error.message}`);
                    // Continue with next article
                }
            }

            // Update last fetched timestamp
            await this.sourcesService.updateLastFetched(sourceId);

            this.logger.log(`Completed processing for source: ${source.name}`);
        } catch (error) {
            this.logger.error(`Error in RSS fetch job: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async processArticle(rssArticle: RssArticle, source: SourceEntity): Promise<void> {
        // Step 1: Create fingerprint for deduplication
        const fingerprint = this.createFingerprint(
            rssArticle.title,
            rssArticle.pubDate,
            new URL(source.url).hostname,
        );

        // Check if article already exists
        const existing = await this.articleRepository.findOne({ where: { fingerprint } });
        if (existing) {
            this.logger.debug(`Article already exists: ${fingerprint}`);
            return;
        }

        // Step 2: Detect language
        const detectedLang = this.languageDetector.detect(
            rssArticle.title + ' ' + rssArticle.content,
        );

        // Step 3: Truncate if needed
        const maxBodyLength = 1_000_000;
        let bodyRaw = rssArticle.content;
        let truncated = false;

        if (bodyRaw.length > maxBodyLength) {
            bodyRaw = bodyRaw.substring(0, maxBodyLength);
            truncated = true;
            this.logger.warn(`Article truncated: ${fingerprint}`);
        }

        // Step 4: Translate to Spanish (if not already Spanish)
        let titleEs = rssArticle.title;
        let bodyEs = bodyRaw;
        let summaryEs = rssArticle.summary || '';
        let translatedFlag = false;
        let confidenceTranslation = 1.0;

        if (detectedLang !== 'es') {
            const translations = await this.translator.translateBatch([
                { text: rssArticle.title, lang: detectedLang },
                { text: bodyRaw, lang: detectedLang },
                { text: rssArticle.summary || '', lang: detectedLang },
            ]);

            if (translations[0].success) {
                titleEs = translations[0].text;
                translatedFlag = true;
                confidenceTranslation = translations[0].confidence;
            }

            if (translations[1].success) {
                bodyEs = translations[1].text;
            }

            if (translations[2].success) {
                summaryEs = translations[2].text;
            }
        }

        // Step 5: Extract IOCs from original content (before translation)
        const extractedIocs = this.enricher.extractIocs(bodyRaw + ' ' + rssArticle.title);

        // Step 6: Generate tags
        const tags = this.generateTags(source, extractedIocs.length > 0);

        // Step 7: Create article entity
        const article = this.articleRepository.create({
            sourceId: source.id,
            titleRaw: rssArticle.title,
            bodyRaw,
            summaryRaw: rssArticle.summary || '',
            sourceUrl: rssArticle.link,
            publishedAt: rssArticle.pubDate,
            languageDetected: detectedLang,
            titleEs,
            bodyEs,
            summaryEs,
            translatedFlag,
            confidenceTranslation,
            fingerprint,
            truncated,
            tags,
            hasIocs: extractedIocs.length > 0,
            iocCount: extractedIocs.length,
        });

        const savedArticle = await this.articleRepository.save(article);
        this.logger.log(`Saved article: ${savedArticle.id}`);

        // Step 8: Save IOCs
        if (extractedIocs.length > 0) {
            const iocEntities = extractedIocs.map(ioc =>
                this.iocRepository.create({
                    articleId: savedArticle.id,
                    type: ioc.type as any, // Cast to any to avoid strict enum check issues with string values
                    value: ioc.value,
                    normalizedValue: ioc.normalizedValue,
                    context: ioc.context,
                    confidence: ioc.confidence,
                }),
            );

            await this.iocRepository.save(iocEntities);
            this.logger.log(`Saved ${iocEntities.length} IOCs for article ${savedArticle.id}`);
        }

        // Step 9: Index to OpenSearch
        try {
            await this.searchService.indexArticle({
                id: savedArticle.id,
                title_es: titleEs,
                body_es: bodyEs,
                summary_es: summaryEs,
                tags: tags,
                iocs: extractedIocs.map(ioc => ioc.value),
                published_at: savedArticle.publishedAt.toISOString(),
                source_name: source.name,
                source_type: source.type,
                translated: translatedFlag,
                has_iocs: extractedIocs.length > 0,
            });

            // Update indexed timestamp
            await this.articleRepository.update(savedArticle.id, {
                indexedAt: new Date(),
            });
        } catch (error) {
            this.logger.error(`Error indexing article ${savedArticle.id}: ${error.message}`);
        }

        // Step 10: Emit WebSocket event
        this.articlesGateway.emitNewArticle({
            event: 'new_article',
            article_id: savedArticle.id,
            title_es: titleEs,
            summary_es: summaryEs.substring(0, 200),
            tags: tags,
            iocs_preview: extractedIocs.slice(0, 3).map(ioc => ioc.value),
            published_at: savedArticle.publishedAt.toISOString(),
            source_name: source.name,
            translated: translatedFlag,
            confidence: confidenceTranslation,
        });

        this.logger.log(`Article processing complete: ${savedArticle.id}`);
    }

    private createFingerprint(title: string, date: Date, domain: string): string {
        const normalized = `${title.toLowerCase().trim()}_${date.toISOString()}_${domain}`;
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }

    private generateTags(source: SourceEntity, hasIocs: boolean): string[] {
        const tags: string[] = [];

        if (source.type) tags.push(source.type);
        if (source.region) tags.push(source.region);
        if (hasIocs) tags.push('iocs');

        return tags;
    }
}
