import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateDepartmentGatewayDto } from './dto/create-department.dto';
import { UpdateDepartmentGatewayDto } from './dto/update-department.dto';

@ApiTags('Department')
@Controller('departments')
export class DepartmentController {
  private readonly coreServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ summary: 'Get all departments (paginated)' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getDepartments(
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
      this.httpService.get(`${this.coreServiceUrl}/departments`, { params }),
    );
    return response.data;
  }

  @ApiOperation({ summary: 'Search departments by name' })
  @ApiParam({ name: 'name', type: String, example: 'Finance', description: 'Department name or part of it' })
  @HttpCode(HttpStatus.OK)
  @Get('/search/name/:name')
  async findByName(@Param('name') name: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.coreServiceUrl}/departments/search/name/${encodeURIComponent(name)}`),
    );
    return response.data;
  }

  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({
    type: CreateDepartmentGatewayDto,
    examples: {
      example1: {
        summary: 'Default example',
        value: {
          name: 'Finance',
          description: 'Handles all financial operations',
          code: 'FIN',
          responsibleName: 'John Doe',
          responsibleEmail: 'john.doe@company.com',
          status: 'ACTIVE',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(@Body() dto: CreateDepartmentGatewayDto) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.coreServiceUrl}/departments`, dto),
    );
    return response.data;
  }

  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', type: String, example: 'clx1234567890abcdef', description: 'Department ID' })
  @ApiBody({
    type: UpdateDepartmentGatewayDto,
    examples: {
      example1: {
        summary: 'Update example',
        value: {
          name: 'Updated IT Department',
          description: 'New description',
          code: 'IT-NEW',
          responsibleName: 'Maria Santos',
          responsibleEmail: 'maria.santos@empresa.com',
          status: 'ACTIVE',
          branchId: 'clx1234567890abcdef'
        },
      },
    },
  })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentGatewayDto
  ) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.coreServiceUrl}/departments/${id}`, dto),
    );
    return response.data;
  }
}
