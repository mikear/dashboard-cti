import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { IocEntity } from './ioc.entity';
import { AuditEventEntity } from '../common/audit-event.entity';
import { GetArticlesDto, ArticleResponseDto, ArticleDetailDto } from './dto/articles.dto';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepository: Repository<ArticleEntity>,
        @InjectRepository(IocEntity)
        private iocRepository: Repository<IocEntity>,
        @InjectRepository(AuditEventEntity)
        private auditRepository: Repository<AuditEventEntity>,
    ) { }

    async findAll(params: GetArticlesDto): Promise<{ data: ArticleResponseDto[]; total: number; page: number; size: number }> {
        const { query, from, to, type, source, page = 1, size = 20 } = params;

        const queryBuilder = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.source', 'source')
            .leftJoinAndSelect('article.iocs', 'iocs');

        // Full-text search on translated Spanish content
        if (query) {
            queryBuilder.andWhere(
                '(article.title_es ILIKE :query OR article.body_es ILIKE :query OR article.summary_es ILIKE :query)',
                { query: `%${query}%` }
            );
        }

        // Date range filter
        if (from) {
            queryBuilder.andWhere('article.published_at >= :from', { from: new Date(from) });
        }
        if (to) {
            queryBuilder.andWhere('article.published_at <= :to', { to: new Date(to) });
        }

        // Type filter
        if (type) {
            queryBuilder.andWhere('source.type = :type', { type });
        }

        // Source filter
        if (source) {
            queryBuilder.andWhere('article.source_id = :source', { source });
        }

        // Pagination
        const skip = (page - 1) * size;
        queryBuilder.skip(skip).take(size);

        // Order by published date descending
        queryBuilder.orderBy('article.published_at', 'DESC');

        const [articles, total] = await queryBuilder.getManyAndCount();

        const data = articles.map(article => this.mapToResponseDto(article));

        return { data, total, page, size };
    }

    async findOne(id: string): Promise<ArticleDetailDto> {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: ['source', 'iocs'],
        });

        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        return this.mapToDetailDto(article);
    }

    async trackClick(id: string, ipAddress?: string, userAgent?: string): Promise<{ sourceUrl: string }> {
        const article = await this.articleRepository.findOne({ where: { id } });

        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        // Create audit event
        const auditEvent = this.auditRepository.create({
            eventType: 'audit',
            entity: 'article',
            entityId: id,
            action: 'click',
            ipAddress,
            userAgent,
            payload: { sourceUrl: article.sourceUrl },
        });

        await this.auditRepository.save(auditEvent);

        return { sourceUrl: article.sourceUrl };
    }

    private mapToResponseDto(article: ArticleEntity): ArticleResponseDto {
        return {
            id: article.id,
            titleEs: article.titleEs || article.titleRaw,
            summaryEs: article.summaryEs || article.summaryRaw || '',
            tags: article.tags || [],
            iocsPreview: article.iocs?.slice(0, 3).map(ioc => ioc.value) || [],
            publishedAt: article.publishedAt.toISOString(),
            sourceName: article.source?.name || 'Unknown',
            translated: article.translatedFlag,
            confidence: article.confidenceTranslation || 1.0,
            hasIocs: article.hasIocs,
            iocCount: article.iocCount,
        };
    }

    private mapToDetailDto(article: ArticleEntity): ArticleDetailDto {
        return {
            ...this.mapToResponseDto(article),
            bodyEs: article.bodyEs || article.bodyRaw,
            sourceUrl: article.sourceUrl,
            languageDetected: article.languageDetected,
            iocs: article.iocs?.map(ioc => ({
                id: ioc.id,
                type: ioc.type,
                value: ioc.value,
                confidence: ioc.confidence,
                context: ioc.context || '',
            })) || [],
        };
    }
}
