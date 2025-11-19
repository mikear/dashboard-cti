import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

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

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    },
    namespace: '/v1/stream',
})
export class ArticlesGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('ArticlesGateway');

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Method to emit new article events
    emitNewArticle(event: NewArticleEvent) {
        this.server.emit('new_article', event);
        this.logger.debug(`Emitted new_article event for article ${event.article_id}`);
    }

    // Method to emit article updates
    emitArticleUpdate(articleId: string, data: any) {
        this.server.emit('article_updated', {
            event: 'article_updated',
            article_id: articleId,
            ...data,
        });
    }
}
