import { IsString, IsBoolean, IsInt, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSourceDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsUrl()
    url: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    region?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiProperty({ required: false, default: 30 })
    @IsOptional()
    @IsInt()
    @Min(1)
    fetchIntervalMinutes?: number;
}

export class SourceResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    url: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    region: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    language: string;

    @ApiProperty()
    enabled: boolean;

    @ApiProperty()
    fetchIntervalMinutes: number;

    @ApiProperty()
    lastFetchedAt: string;
}
