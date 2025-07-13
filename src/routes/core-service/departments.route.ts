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
import { ApiOperation, ApiTags, ApiParam, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
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

  @ApiOperation({
    summary: 'Filter departments with dynamic filters',
    description: `
This endpoint allows advanced filtering of departments using query parameters.

How to filter:
- All filters are passed as query parameters.
- You can combine multiple filters (AND logic) by passing several parameters.
- For OR logic, prefix the parameter with or. (e.g., or.name).
- Use operators like eq: (equals), in: (in list), etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: status=in:ACTIVE,INACTIVE

Examples:

Simple filter (AND):
GET /departments/filter?status=eq:ACTIVE&name=eq:Finance

Combined filter (AND + OR):
GET /departments/filter?status=eq:ACTIVE&or.name=eq:Finance&or.code=eq:FIN

With pagination:
GET /departments/filter?page=1&size=10&name=eq:Finance
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered departments',
    schema: {
      example: {
        data: [
          {
            id: 'clx1234567890abcdef',
            name: 'Finance',
            description: 'Handles all financial operations',
            code: 'FIN',
            responsibleName: 'John Doe',
            responsibleEmail: 'john.doe@company.com',
            status: 'ACTIVE',
            branchId: '00000000-0000-0000-0000-000000000000',
            createdAt: '2024-06-25T12:34:56.789Z',
            updatedAt: '2024-06-25T12:34:56.789Z'
          }
        ],
        pagination: {
          page: 1,
          size: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        },
        filter: {
          applied: '{"$and":[{"status":{"$eq":"ACTIVE"}},{"name":{"$eq":"Finance"}}]}',
          parsed: {
            $and: [
              { status: { $eq: 'ACTIVE' } },
              { name: { $eq: 'Finance' } }
            ]
          }
        }
      }
    }
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 20, max: 100)',
    example: 10
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description: 'JSON with dynamic filters. See DepartmentFilterDto for all available fields.',
    examples: {
      example1: {
        summary: 'Filter by name',
        value: '{"name":"Finance"}'
      },
      example2: {
        summary: 'Filter by status',
        value: '{"status":"ACTIVE"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"name":"Finance","status":"ACTIVE"}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterDepartments(@Query() query: Record<string, any>) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/departments/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering departments';
      throw new Error(message);
    }
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
