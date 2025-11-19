import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { CreateSourceDto, SourceResponseDto } from './dto/sources.dto';

@ApiTags('sources')
@Controller('v1/sources')
export class SourcesController {
    constructor(private readonly sourcesService: SourcesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all RSS sources' })
    @ApiResponse({ status: 200, description: 'List of sources', type: [SourceResponseDto] })
    async getSources() {
        return this.sourcesService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Add new RSS source (admin)' })
    @ApiResponse({ status: 201, description: 'Source created', type: SourceResponseDto })
    async createSource(@Body() createSourceDto: CreateSourceDto) {
        return this.sourcesService.create(createSourceDto);
    }
}
