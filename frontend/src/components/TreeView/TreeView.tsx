import React, { useState } from 'react';
import type { TreeNode } from '../../types';

interface TreeViewProps {
    nodes: TreeNode[];
    onNodeClick: (node: TreeNode) => void;
    selectedNode?: TreeNode | null;
}

export const TreeView: React.FC<TreeViewProps> = ({ nodes, onNodeClick, selectedNode }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedNode?.id === node.id;

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`
            flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md text-sm
            transition-colors duration-150
            ${isSelected ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}
          `}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={() => {
                        if (hasChildren) {
                            toggleNode(node.id);
                        }
                        onNodeClick(node);
                    }}
                >
                    <div className="flex items-center gap-2 flex-1">
                        {hasChildren && (
                            <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                        {!hasChildren && <span className="w-4"></span>}
                        <span className="font-medium">{node.label}</span>
                    </div>
                    {node.count > 0 && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {node.count}
                        </span>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Fuentes</h2>
                <p className="text-xs text-gray-500 mt-1">Filtrar por tipo y región</p>
            </div>
            <div className="p-2">
                {nodes.map(node => renderNode(node))}
            </div>
        </div>
    );
};
