import React, { useState } from 'react';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import type { GetArticlesParams } from '../../types';

interface SearchPanelProps {
    onSearch: (params: GetArticlesParams) => void;
    sources: Array<{ id: string; name: string; type: string }>;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, sources }) => {
    const [query, setQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<'24h' | '7d' | '30d' | 'custom' | ''>('');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedSource, setSelectedSource] = useState('');

    const handleSearch = () => {
        const params: GetArticlesParams = {
            query: query || undefined,
            type: selectedType || undefined,
            source: selectedSource || undefined,
        };

        // Date filters
        const now = new Date();
        switch (dateFilter) {
            case '24h':
                params.from = addDays(now, -1).toISOString();
                break;
            case '7d':
                params.from = addDays(now, -7).toISOString();
                break;
            case '30d':
                params.from = addDays(now, -30).toISOString();
                break;
            case 'custom':
                if (customFrom) params.from = startOfDay(new Date(customFrom)).toISOString();
                if (customTo) params.to = endOfDay(new Date(customTo)).toISOString();
                break;
        }

        onSearch(params);
    };

    const handleReset = () => {
        setQuery('');
        setDateFilter('');
        setCustomFrom('');
        setCustomTo('');
        setSelectedType('');
        setSelectedSource('');
        onSearch({});
    };

    const types = Array.from(new Set(sources.map(s => s.type).filter(Boolean)));

    return (
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* Search Query */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Buscar en título y contenido..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Buscar
                    </button>
                    <button
                        onClick={handleReset}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Limpiar
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha
                        </label>
                        <select
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                            <option value="">Todas</option>
                            <option value="24h">Últimas 24 horas</option>
                            <option value="7d">Últimos 7 días</option>
                            <option value="30d">Últimos 30 días</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                        </label>
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                            <option value="">Todos</option>
                            {types.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Source Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fuente
                        </label>
                        <select
                            value={selectedSource}
                            onChange={e => setSelectedSource(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                            <option value="">Todas</option>
                            {sources.map(source => (
                                <option key={source.id} value={source.id}>
                                    {source.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Custom Date Range */}
                {dateFilter === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={customFrom}
                                onChange={e => setCustomFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hasta
                            </label>
                            <input
                                type="date"
                                value={customTo}
                                onChange={e => setCustomTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
