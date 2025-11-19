import React from 'react';
import { ArticleCard } from './ArticleCard';
import type { Article } from '../../types';

interface ArticleFeedProps {
    articles: Article[];
    loading: boolean;
    onArticleClick: (article: Article) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

export const ArticleFeed: React.FC<ArticleFeedProps> = ({
    articles,
    loading,
    onArticleClick,
    onLoadMore,
    hasMore,
}) => {
    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Feed de Artículos</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {articles.length} artículo{articles.length !== 1 ? 's' : ''} encontrado{articles.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading && articles.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando artículos...</p>
                        </div>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay artículos</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Intenta ajustar los filtros de búsqueda.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {articles.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onClick={() => onArticleClick(article)}
                            />
                        ))}

                        {/* Load More */}
                        {hasMore && onLoadMore && (
                            <button
                                onClick={onLoadMore}
                                disabled={loading}
                                className="w-full py-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Cargando...' : 'Cargar más'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
