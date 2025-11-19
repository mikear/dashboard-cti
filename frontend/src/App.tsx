import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { TreeView } from './components/TreeView/TreeView';
import { ArticleFeed } from './components/Feed/ArticleFeed';
import { ArticleDetail } from './components/Detail/ArticleDetail';
import { SearchPanel } from './components/Search/SearchPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { articlesApi, sourcesApi } from './services/api';
import type { Article, GetArticlesParams, TreeNode } from './types';
import './index.css';

const queryClient = new QueryClient();

function AppContent() {
    const [searchParams, setSearchParams] = useState<GetArticlesParams>({});
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [selectedTreeNode, setSelectedTreeNode] = useState<TreeNode | null>(null);

    const { connected, newArticleEvents } = useWebSocket();

    // Fetch sources
    const { data: sources = [] } = useQuery({
        queryKey: ['sources'],
        queryFn: sourcesApi.getSources,
    });

    // Fetch articles
    const {
        data: articlesResponse,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['articles', searchParams],
        queryFn: () => articlesApi.getArticles(searchParams),
    });

    // Fetch selected article details
    const { data: articleDetail } = useQuery({
        queryKey: ['article', selectedArticle?.id],
        queryFn: () => articlesApi.getArticle(selectedArticle!.id),
        enabled: !!selectedArticle,
    });

    // Build tree nodes from sources
    const treeNodes: TreeNode[] = React.useMemo(() => {
        const typeMap = new Map<string, Map<string, typeof sources>>();

        sources.forEach(source => {
            if (!typeMap.has(source.type)) {
                typeMap.set(source.type, new Map());
            }
            const regionMap = typeMap.get(source.type)!;
            const region = source.region || 'Unknown';
            if (!regionMap.has(region)) {
                regionMap.set(region, []);
            }
            regionMap.get(region)!.push(source);
        });

        const nodes: TreeNode[] = [];
        typeMap.forEach((regionMap, type) => {
            const regionNodes: TreeNode[] = [];
            regionMap.forEach((sources, region) => {
                const sourceNodes: TreeNode[] = sources.map(source => ({
                    id: source.id,
                    label: source.name,
                    type: 'source',
                    count: 0,
                }));
                regionNodes.push({
                    id: `${type}-${region}`,
                    label: region,
                    type: 'region',
                    count: 0,
                    children: sourceNodes,
                });
            });
            nodes.push({
                id: type,
                label: type,
                type: 'type',
                count: 0,
                children: regionNodes,
            });
        });

        return nodes;
    }, [sources]);

    // Handle new article events
    useEffect(() => {
        if (newArticleEvents.length > 0) {
            refetch();
        }
    }, [newArticleEvents, refetch]);

    const articles = articlesResponse?.data || [];

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">CTI Platform</h1>
                            <p className="text-sm text-primary-100">
                                Cyber Threat Intelligence - Feed en tiempo real
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* WebSocket Status */}
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'
                                        } animate-pulse`}
                                />
                                <span className="text-sm">
                                    {connected ? 'Conectado' : 'Desconectado'}
                                </span>
                            </div>
                            {/* New Articles Badge */}
                            {newArticleEvents.length > 0 && (
                                <div className="bg-white text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {newArticleEvents.length} nuevo{newArticleEvents.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Panel */}
            <SearchPanel
                onSearch={params => setSearchParams(params)}
                sources={sources.map(s => ({ id: s.id, name: s.name, type: s.type }))}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - TreeView */}
                <div className="w-64 flex-shrink-0">
                    <TreeView
                        nodes={treeNodes}
                        selectedNode={selectedTreeNode}
                        onNodeClick={node => {
                            setSelectedTreeNode(node);
                            if (node.type === 'type') {
                                setSearchParams({ type: node.id });
                            } else if (node.type === 'source') {
                                setSearchParams({ source: node.id });
                            }
                        }}
                    />
                </div>

                {/* Center - Feed */}
                <div className="flex-1 min-w-0">
                    <ArticleFeed
                        articles={articles}
                        loading={isLoading}
                        onArticleClick={article => setSelectedArticle(article)}
                    />
                </div>

                {/* Right Sidebar - Detail */}
                <div className="w-96 flex-shrink-0 border-l border-gray-200">
                    <ArticleDetail
                        article={articleDetail || selectedArticle}
                        onClose={() => setSelectedArticle(null)}
                    />
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContent />
        </QueryClientProvider>
    );
}

export default App;
