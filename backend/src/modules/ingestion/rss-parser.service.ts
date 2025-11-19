import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { SourceEntity } from '../sources/source.entity';

export interface RssArticle {
    title: string;
    content: string;
    link: string;
    pubDate: Date;
    summary?: string;
}

@Injectable()
export class RssParserService {
    private readonly logger = new Logger(RssParserService.name);
    private parser: Parser;

    constructor() {
        this.parser = new Parser({
            customFields: {
                item: [
                    ['content:encoded', 'content:encoded'],
                    ['description', 'description'],
                ],
            },
        });
    }

    async fetchFeed(source: SourceEntity): Promise<RssArticle[]> {
        try {
            this.logger.log(`Fetching RSS feed: ${source.name}`);
            const feed = await this.parser.parseURL(source.url);

            const articles: RssArticle[] = [];
            const maxArticles = parseInt(process.env.RSS_MAX_ARTICLES_PER_FEED) || 50;

            for (const item of feed.items.slice(0, maxArticles)) {
                if (!item.title || !item.link) continue;

                const content =
                    (item as any)['content:encoded'] ||
                    item.content ||
                    item.description ||
                    '';

                articles.push({
                    title: item.title,
                    content: this.stripHtml(content),
                    link: item.link,
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    summary: item.contentSnippet || '',
                });
            }

            this.logger.log(`Fetched ${articles.length} articles from ${source.name}`);
            return articles;
        } catch (error) {
            this.logger.error(`Error fetching RSS feed ${source.name}:`, error.message);
            throw error;
        }
    }

    private stripHtml(html: string): string {
        // Basic HTML stripping - in production use a library like sanitize-html
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
