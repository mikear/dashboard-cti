import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { NewArticleEvent } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

export const useWebSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [newArticleEvents, setNewArticleEvents] = useState<NewArticleEvent[]>([]);

    useEffect(() => {
        const socketInstance = io(`${WS_URL}/v1/stream`, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
        });

        socketInstance.on('connect', () => {
            console.log('WebSocket connected');
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        });

        socketInstance.on('new_article', (event: NewArticleEvent) => {
            console.log('New article event:', event);
            setNewArticleEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100
        });

        socketInstance.on('article_updated', (event: any) => {
            console.log('Article updated:', event);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, []);

    const clearNewArticles = useCallback(() => {
        setNewArticleEvents([]);
    }, []);

    return {
        socket,
        connected,
        newArticleEvents,
        clearNewArticles,
    };
};
