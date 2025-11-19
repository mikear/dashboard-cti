import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

export interface ArticleDocument {
    id: string;
    title_es: string;
    body_es: string;
    summary_es: string;
    tags: string[];
    iocs: string[];
    published_at: string;
    source_name: string;
    source_type: string;
    translated: boolean;
    has_iocs: boolean;
}

const isNoDocker = process.env.NO_DOCKER === 'true';

@Injectable()
export class SearchService implements OnModuleInit {
    private client: Client;
    private readonly indexName = 'articles';
    private readonly logger = new Logger(SearchService.name);

    constructor() {
        if (!isNoDocker) {
            this.client = new Client({
                node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
            });
        }
    }

    async onModuleInit() {
        if (!isNoDocker) {
            await this.ensureIndex();
        }
    }

    private async ensureIndex() {
        try {
            const exists = await this.client.indices.exists({ index: this.indexName });

            if (!exists.body) {
                await this.client.indices.create({
                    index: this.indexName,
                    body: {
                        mappings: {
                            properties: {
                                id: { type: 'keyword' },
                                title_es: { type: 'text', analyzer: 'spanish' },
                                body_es: { type: 'text', analyzer: 'spanish' },
                                summary_es: { type: 'text', analyzer: 'spanish' },
                                tags: { type: 'keyword' },
                                iocs: { type: 'keyword' },
                                published_at: { type: 'date' },
                                source_name: { type: 'keyword' },
                                source_type: { type: 'keyword' },
                                translated: { type: 'boolean' },
                                has_iocs: { type: 'boolean' },
                            },
                        },
                    },
                });
                this.logger.log(`Created index: ${this.indexName}`);
            }
        } catch (error) {
            this.logger.error('Error ensuring index:', error.message);
        }
    }

    async indexArticle(document: ArticleDocument): Promise<void> {
        if (isNoDocker) return;
        try {
            await this.client.index({
                index: this.indexName,
                id: document.id,
                body: document,
                refresh: true,
            });
            this.logger.debug(`Indexed article: ${document.id}`);
        } catch (error) {
            this.logger.error(`Error indexing article ${document.id}:`, error.message);
            throw error;
        }
    }

    async search(
        query: string,
        filters: {
            from?: Date;
            to?: Date;
            type?: string;
            hasIocs?: boolean;
        } = {},
    ): Promise<{ hits: any[]; total: number }> {
        if (isNoDocker) {
            this.logger.warn('Search is disabled in NO_DOCKER mode');
            return { hits: [], total: 0 };
        }
        try {
            const must: any[] = [];
            const filter: any[] = [];

            // Full-text search
            if (query) {
                must.push({
                    multi_match: {
                        query,
                        fields: ['title_es^2', 'summary_es^1.5', 'body_es'],
                        type: 'best_fields',
                    },
                });
            } else {
                must.push({ match_all: {} });
            }

            // Date range filter
            if (filters.from || filters.to) {
                const range: any = {};
                if (filters.from) range.gte = filters.from.toISOString();
                if (filters.to) range.lte = filters.to.toISOString();
                filter.push({ range: { published_at: range } });
            }

            // Type filter
            if (filters.type) {
                filter.push({ term: { source_type: filters.type } });
            }

            // IOCs filter
            if (filters.hasIocs !== undefined) {
                filter.push({ term: { has_iocs: filters.hasIocs } });
            }

            const response = await this.client.search({
                index: this.indexName,
                body: {
                    query: {
                        bool: {
                            must,
                            filter,
                        },
                    },
                    sort: [{ published_at: { order: 'desc' } }],
                    size: 100,
                },
            });

            return {
                hits: response.body.hits.hits.map((hit: any) => ({
                    id: hit._id,
                    ...hit._source,
                })),
                total: response.body.hits.total.value,
            };
        } catch (error) {
            this.logger.error('Error searching:', error.message);
            throw error;
        }
    }

    async getAggregations(): Promise<any> {
        if (isNoDocker) return {};
        try {
            const response = await this.client.search({
                index: this.indexName,
                body: {
                    size: 0,
                    aggs: {
                        by_type: {
                            terms: { field: 'source_type', size: 20 },
                        },
                        by_source: {
                            terms: { field: 'source_name', size: 20 },
                        },
                        by_date: {
                            date_histogram: {
                                field: 'published_at',
                                calendar_interval: 'day',
                            },
                        },
                        with_iocs: {
                            filter: { term: { has_iocs: true } },
                        },
                    },
                },
            });

            return response.body.aggregations;
        } catch (error) {
            this.logger.error('Error getting aggregations:', error.message);
            throw error;
        }
    }
}
