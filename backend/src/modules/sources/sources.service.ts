import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourceEntity } from './source.entity';
import { CreateSourceDto, SourceResponseDto } from './dto/sources.dto';

@Injectable()
export class SourcesService implements OnModuleInit {
    private readonly logger = new Logger(SourcesService.name);

    constructor(
        @InjectRepository(SourceEntity)
        private sourceRepository: Repository<SourceEntity>,
    ) { }

    async onModuleInit() {
        // Initialize default sources if none exist
        const count = await this.sourceRepository.count();
        if (count === 0) {
            this.logger.log('No sources found. Initializing default RSS sources...');
            await this.initializeDefaultSources();
        }
    }

    private async initializeDefaultSources() {
        const defaultSources = [
            {
                id: '1',
                name: 'Krebs on Security',
                url: 'https://krebsonsecurity.com/feed/',
                type: 'threat_intel',
                region: 'Americas',
                country: 'USA',
                language: 'en',
                enabled: true,
                fetchIntervalMinutes: 30,
            },
            {
                id: '2',
                name: 'The Hacker News',
                url: 'https://feeds.feedburner.com/TheHackersNews',
                type: 'threat_intel',
                region: 'Global',
                country: 'Global',
                language: 'en',
                enabled: true,
                fetchIntervalMinutes: 30,
            },
            {
                id: '3',
                name: 'Schneier on Security',
                url: 'https://www.schneier.com/blog/atom.xml',
                type: 'threat_intel',
                region: 'Americas',
                country: 'USA',
                language: 'en',
                enabled: true,
                fetchIntervalMinutes: 30,
            },
            {
                id: '4',
                name: 'Threatpost',
                url: 'https://threatpost.com/feed/',
                type: 'threat_intel',
                region: 'Americas',
                country: 'USA',
                language: 'en',
                enabled: true,
                fetchIntervalMinutes: 30,
            },
            {
                id: '5',
                name: 'Dark Reading',
                url: 'https://www.darkreading.com/rss.xml',
                type: 'threat_intel',
                region: 'Americas',
                country: 'USA',
                language: 'en',
                enabled: true,
                fetchIntervalMinutes: 30,
            },
        ];

        for (const sourceData of defaultSources) {
            const source = this.sourceRepository.create(sourceData);
            await this.sourceRepository.save(source);
            this.logger.log(`Initialized source: ${source.name}`);
        }
    }

    async findAll(): Promise<SourceResponseDto[]> {
        const sources = await this.sourceRepository.find({
            order: { name: 'ASC' },
        });

        return sources.map(source => this.mapToDto(source));
    }

    async create(createSourceDto: CreateSourceDto): Promise<SourceResponseDto> {
        const source = this.sourceRepository.create(createSourceDto);
        const saved = await this.sourceRepository.save(source);
        return this.mapToDto(saved);
    }

    async findEnabled(): Promise<SourceEntity[]> {
        return this.sourceRepository.find({
            where: { enabled: true },
        });
    }

    async updateLastFetched(id: string): Promise<void> {
        await this.sourceRepository.update(id, {
            lastFetchedAt: new Date(),
        });
    }

    private mapToDto(source: SourceEntity): SourceResponseDto {
        return {
            id: source.id,
            name: source.name,
            url: source.url,
            type: source.type,
            region: source.region,
            country: source.country,
            language: source.language,
            enabled: source.enabled,
            fetchIntervalMinutes: source.fetchIntervalMinutes,
            lastFetchedAt: source.lastFetchedAt?.toISOString(),
        };
    }
}
