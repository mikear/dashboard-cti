import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Article } from '../../types';
import { articlesApi } from '../../services/api';

interface ArticleDetailProps {
    article: Article | null;
    onClose: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onClose }) => {
    const [isOpening, setIsOpening] = useState(false);

    if (!article) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Selecciona un artículo</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Haz clic en un artículo del feed para ver los detalles.
                    </p>
                </div>
            </div>
        );
    }

    const handleOpenSource = async () => {
        try {
            setIsOpening(true);
            const result = await articlesApi.trackClick(article.id);
            window.open(result.sourceUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error tracking click:', error);
        } finally {
            setIsOpening(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white animate-slide-in">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.titleEs}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">{article.sourceName}</span>
                        <span>•</span>
                        <span>
                            {format(new Date(article.publishedAt), "d 'de' MMMM 'de' yyyy, HH:mm", {
                                locale: es,
                            })}
                        </span>
                        {article.languageDetected && (
                            <>
                                <span>•</span>
                                <span className="uppercase">{article.languageDetected}</span>
                            </>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Tags and Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                    {article.translated && (
                        <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                            ✓ Traducido ({Math.round(article.confidence * 100)}% confianza)
                        </span>
                    )}
                    {article.hasIocs && (
                        <span className="text-sm bg-danger-50 text-danger-700 px-3 py-1 rounded-full font-medium">
                            {article.iocCount} IOC{article.iocCount !== 1 ? 's' : ''} detectado{article.iocCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Summary */}
                {article.summaryEs && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                        <p className="text-sm font-medium text-gray-900">{article.summaryEs}</p>
                    </div>
                )}

                {/* Body */}
                <div className="prose prose-sm max-w-none mb-8">
                    <p className="text-gray-700 whitespace-pre-wrap">{article.bodyEs}</p>
                </div>

                {/* IOCs Section */}
                {article.iocs && article.iocs.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Indicadores de Compromiso (IOCs)
                        </h3>
                        <div className="space-y-3">
                            {article.iocs.map(ioc => (
                                <div
                                    key={ioc.id}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase">
                                                    {ioc.type.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {Math.round(ioc.confidence * 100)}% confianza
                                                </span>
                                            </div>
                                            <code className="text-sm font-mono text-gray-900 break-all">
                                                {ioc.value}
                                            </code>
                                        </div>
                                    </div>
                                    {ioc.context && (
                                        <p className="text-xs text-gray-600 mt-2 italic">
                                            Contexto: "{ioc.context}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Open Source Button */}
                <div className="pt-6 border-t border-gray-200">
                    <button
                        onClick={handleOpenSource}
                        disabled={isOpening}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isOpening ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Abriendo...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                                Abrir Fuente Original
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Se registrará esta acción en la auditoría
                    </p>
                </div>
            </div>
        </div>
    );
};
