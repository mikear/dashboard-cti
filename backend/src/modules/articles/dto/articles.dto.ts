import { IsOptional, IsString, IsInt, Min, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetArticlesDto {
    @ApiProperty({ required: false, description: 'Search query for full-text search' })
    @IsOptional()
    @IsString()
    query?: string;

    @ApiProperty({ required: false, description: 'Start date (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiProperty({ required: false, description: 'End date (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiProperty({ required: false, description: 'Filter by source type' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false, description: 'Filter by source ID' })
    @IsOptional()
    @IsUUID()
    source?: string;

    @ApiProperty({ required: false, description: 'Page number (1-indexed)', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, description: 'Page size', default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    size?: number = 20;
}

export class ArticleResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    titleEs: string;

    @ApiProperty()
    summaryEs: string;

    @ApiProperty()
    tags: string[];

    @ApiProperty()
    iocsPreview: string[];

    @ApiProperty()
    publishedAt: string;

    @ApiProperty()
    sourceName: string;

    @ApiProperty()
    translated: boolean;

    @ApiProperty()
    confidence: number;

    @ApiProperty()
    hasIocs: boolean;

    @ApiProperty()
    iocCount: number;
}

export class ArticleDetailDto extends ArticleResponseDto {
    @ApiProperty()
    bodyEs: string;

    @ApiProperty()
    sourceUrl: string;

    @ApiProperty()
    languageDetected: string;

    @ApiProperty()
    iocs: IocDto[];
}

export class IocDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    value: string;

    @ApiProperty()
    confidence: number;

    @ApiProperty()
    context: string;
}

export class ClickTrackDto {
    @ApiProperty()
    sourceUrl: string;
}
