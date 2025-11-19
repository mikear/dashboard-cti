import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticlesGateway } from './articles.gateway';
import { ArticleEntity } from './article.entity';
import { IocEntity } from './ioc.entity';
import { AuditEventEntity } from '../common/audit-event.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ArticleEntity, IocEntity, AuditEventEntity]),
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService, ArticlesGateway],
    exports: [ArticlesService, ArticlesGateway],
})
export class ArticlesModule { }
