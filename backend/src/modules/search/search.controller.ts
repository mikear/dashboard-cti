import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('v1/search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('fields')
    @ApiOperation({ summary: 'Get available search facets and aggregations' })
    @ApiResponse({ status: 200, description: 'Facets data' })
    async getFields() {
        return this.searchService.getAggregations();
    }
}
