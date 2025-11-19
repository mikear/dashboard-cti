export interface Article {
    id: string;
    titleEs: string;
    summaryEs: string;
    bodyEs?: string;
    tags: string[];
    iocsPreview: string[];
    publishedAt: string;
    sourceName: string;
    sourceUrl?: string;
    translated: boolean;
    confidence: number;
    hasIocs: boolean;
    iocCount: number;
    languageDetected?: string;
    iocs?: Ioc[];
}

export interface Ioc {
    id: string;
    type: string;
    value: string;
    confidence: number;
    context: string;
}

export interface Source {
    id: string;
    name: string;
    url: string;
    type: string;
    region: string;
    country: string;
    language: string;
    enabled: boolean;
    fetchIntervalMinutes: number;
    lastFetchedAt: string;
}

export interface GetArticlesParams {
    query?: string;
    from?: string;
    to?: string;
    type?: string;
    source?: string;
    page?: number;
    size?: number;
}

export interface ArticlesResponse {
    data: Article[];
    total: number;
    page: number;
    size: number;
}

export interface NewArticleEvent {
    event: 'new_article';
    article_id: string;
    title_es: string;
    summary_es: string;
    tags: string[];
    iocs_preview: string[];
    published_at: string;
    source_name: string;
    translated: boolean;
    confidence: number;
}

export interface TreeNode {
    id: string;
    label: string;
    type: 'type' | 'region' | 'source';
    count: number;
    children?: TreeNode[];
    expanded?: boolean;
}
