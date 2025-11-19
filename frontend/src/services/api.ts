import axios from 'axios';
import type { Article, ArticlesResponse, GetArticlesParams, Source } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
});

export const articlesApi = {
    getArticles: async (params: GetArticlesParams): Promise<ArticlesResponse> => {
        const response = await api.get<ArticlesResponse>('/v1/articles', { params });
        return response.data;
    },

    getArticle: async (id: string): Promise<Article> => {
        const response = await api.get<Article>(`/v1/articles/${id}`);
        return response.data;
    },

    trackClick: async (id: string): Promise<{ sourceUrl: string }> => {
        const response = await api.post<{ sourceUrl: string }>(`/v1/articles/${id}/click`);
        return response.data;
    },
};

export const sourcesApi = {
    getSources: async (): Promise<Source[]> => {
        const response = await api.get<Source[]>('/v1/sources');
        return response.data;
    },

    createSource: async (source: Partial<Source>): Promise<Source> => {
        const response = await api.post<Source>('/v1/sources', source);
        return response.data;
    },
};

export const searchApi = {
    getFields: async (): Promise<any> => {
        const response = await api.get('/v1/search/fields');
        return response.data;
    },
};
