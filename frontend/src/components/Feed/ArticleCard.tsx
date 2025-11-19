import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Article } from '../../types';

interface ArticleCardProps {
    article: Article;
    onClick: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
                    {article.titleEs}
                </h3>
                {article.hasIocs && (
                    <span className="flex-shrink-0 bg-danger-100 text-danger-700 text-xs px-2 py-1 rounded-md font-medium">
                        {article.iocCount} IOC{article.iocCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {article.summaryEs}
            </p>

            {/* IOCs Preview */}
            {article.iocsPreview.length > 0 && (
                <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                        {article.iocsPreview.map((ioc, idx) => (
                            <code
                                key={idx}
                                className="text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-300 font-mono"
                            >
                                {ioc}
                            </code>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
                {article.tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                    >
                        {tag}
                    </span>
                ))}
                {article.translated && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        ✓ Traducido
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{article.sourceName}</span>
                <span>
                    {formatDistanceToNow(new Date(article.publishedAt), {
                        addSuffix: true,
                        locale: es,
                    })}
                </span>
            </div>

            {/* Confidence indicator */}
            {article.translated && (
                <div className="mt-2">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-purple-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${article.confidence * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">
                            {Math.round(article.confidence * 100)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
