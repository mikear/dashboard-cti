import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from './modules/articles/articles.module';
import { SourcesModule } from './modules/sources/sources.module';
import { SearchModule } from './modules/search/search.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';

const isNoDocker = process.env.NO_DOCKER === 'true';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Database
        TypeOrmModule.forRoot({
            type: isNoDocker ? 'sqlite' : 'postgres',
            database: isNoDocker ? 'database.sqlite' : (process.env.DATABASE_NAME || 'cti_db'),
            ...(isNoDocker ? {} : {
                host: process.env.DATABASE_HOST || 'localhost',
                port: parseInt(process.env.DATABASE_PORT) || 5432,
                username: process.env.DATABASE_USER || 'cti',
                password: process.env.DATABASE_PASSWORD || 'cti_password',
            }),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: isNoDocker, // Auto-sync schema in local mode
            logging: process.env.NODE_ENV === 'development',
        }),

        // Queue (Skip if NO_DOCKER)
        ...(isNoDocker ? [] : [
            BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
            }),
        ]),

        // Modules
        ArticlesModule,
        SourcesModule,
        SearchModule,
        IngestionModule,
    ],
})
export class AppModule { }
