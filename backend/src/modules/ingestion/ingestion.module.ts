import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionProcessor } from './ingestion.processor';
import { IngestionSchedulerService } from './ingestion-scheduler.service';
import { RssParserService } from './rss-parser.service';
import { LanguageDetectorService } from './language-detector.service';
import { TranslationService } from './translation.service';
import { EnrichmentService } from './enrichment.service';
import { ArticleEntity } from '../articles/article.entity';
import { IocEntity } from '../articles/ioc.entity';
import { SourceEntity } from '../sources/source.entity';
import { SourcesModule } from '../sources/sources.module';
import { SearchModule } from '../search/search.module';
import { ArticlesModule } from '../articles/articles.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'ingestion',
        }),
        TypeOrmModule.forFeature([ArticleEntity, IocEntity, SourceEntity]),
        SourcesModule,
        SearchModule,
        ArticlesModule,
    ],
    providers: [
        IngestionProcessor,
        IngestionSchedulerService,
        RssParserService,
        LanguageDetectorService,
        TranslationService,
        EnrichmentService,
    ],
    exports: [IngestionSchedulerService],
})
export class IngestionModule { }
