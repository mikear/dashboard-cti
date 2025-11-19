import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourceEntity } from './source.entity';
import { CreateSourceDto, SourceResponseDto } from './dto/sources.dto';

@Injectable()
export class SourcesService {
    constructor(
        @InjectRepository(SourceEntity)
        private sourceRepository: Repository<SourceEntity>,
    ) { }

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
