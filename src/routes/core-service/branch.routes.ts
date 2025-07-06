import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Branch')
@Controller('branches')
export class BranchController {
  private readonly coreServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ summary: 'Get all branches (paginated)' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getBranches(
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (take !== undefined) params.take = take;
    if (skip !== undefined) params.skip = skip;

    const response = await firstValueFrom(
      this.httpService.get(`${this.coreServiceUrl}/branches`, { params }),
    );
    return response.data;
  }

  @ApiOperation({ summary: 'Search branches by name' })
  @ApiParam({ name: 'name', type: String, example: 'Centro', description: 'Branch name or part of it' })
  @HttpCode(HttpStatus.OK)
  @Get('/search/name/:name')
  async findByName(@Param('name') name: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.coreServiceUrl}/branches/search/name/${encodeURIComponent(name)}`),
    );
    return response.data;
  }
}
