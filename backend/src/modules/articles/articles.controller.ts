import { Controller, Get, Post, Query, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { GetArticlesDto, ArticleResponseDto, ArticleDetailDto, ClickTrackDto } from './dto/articles.dto';
import { Request } from 'express';

@ApiTags('articles')
@Controller('v1/articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Get()
    @ApiOperation({ summary: 'Get articles with filters and pagination' })
    @ApiResponse({ status: 200, description: 'List of articles', type: [ArticleResponseDto] })
    async getArticles(@Query() query: GetArticlesDto) {
        return this.articlesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get article by ID' })
    @ApiResponse({ status: 200, description: 'Article details', type: ArticleDetailDto })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async getArticle(@Param('id') id: string) {
        return this.articlesService.findOne(id);
    }

    @Post(':id/click')
    @ApiOperation({ summary: 'Track article click and return source URL' })
    @ApiResponse({ status: 200, description: 'Source URL returned', type: ClickTrackDto })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async trackClick(@Param('id') id: string, @Req() req: Request) {
        const ipAddress = req.ip;
        const userAgent = req.get('user-agent');
        return this.articlesService.trackClick(id, ipAddress, userAgent);
    }
}
