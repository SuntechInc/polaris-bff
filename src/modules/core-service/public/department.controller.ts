import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  Post,
  Body,
  HttpException,
  Logger,
  Put,
  Delete,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiParam, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { CreateDepartmentGatewayDto } from '@/dto/create-department.dto';
import { UpdateDepartmentGatewayDto } from '@/dto/update-department.dto';

@ApiTags('Department')
@Controller('departments')
export class DepartmentController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(DepartmentController.name);

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
- contains: (contains text) Example: name=contains:Engineering

Examples:

Simple filter (AND):
GET /departments/filter?companyId=123&status=eq:ACTIVE

Combined filter (AND + OR):
GET /departments/filter?companyId=123&status=eq:ACTIVE&or.name=contains:Engineering&or.code=eq:DEPT001
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered departments',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            name: "Engineering",
            code: "DEPT001",
            description: "Software Engineering Department",
            status: "ACTIVE",
            companyId: "00000000000000000000000000000000",
            branchId: "00000000000000000000000000000000",
            createdAt: "2025-06-23T23:32:29.601Z",
            updatedAt: "2025-06-23T23:32:29.601Z"
          }
        ],
        pagination: {
          page: 1,
          size: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      }
    }
  })
  @ApiQuery({ 
    name: 'companyId', 
    required: true, 
    type: String, 
    description: 'Company ID (required)',
    example: '00000000-0000-0000-0000-000000000000'
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
    example: 20
  })
  @ApiQuery({ 
    name: 'filter', 
    required: false, 
    type: String, 
    description: 'JSON with dynamic filters',
    examples: {
      example1: {
        summary: 'Filter by status',
        value: '{"status":"ACTIVE"}'
      },
      example2: {
        summary: 'Filter by name',
        value: '{"name":"Engineering"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"status":"ACTIVE","code":"DEPT001"}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterDepartments(@Query() query: Record<string, any>) {
    try {
      // Validate if companyId was provided
      if (!query.companyId) {
        throw new HttpException(
          { message: 'companyId is required to filter departments' }, 
          HttpStatus.BAD_REQUEST
        );
      }

      console.log('Forwarding params to core-service:', query);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/departments/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering departments';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({
    type: CreateDepartmentGatewayDto,
    examples: {
      example1: {
        summary: 'Basic department creation',
        value: {
          name: 'Engineering',
          code: 'DEPT001',
          description: 'Software Engineering Department',
          status: 'ACTIVE',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(@Body() dto: CreateDepartmentGatewayDto) {
    this.logger.log(`Trying to create department: ${JSON.stringify(dto)}`, 'DepartmentController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/departments`, 'DepartmentController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/departments`, dto),
      );
      
      this.logger.log(`Department created successfully: ${JSON.stringify(response.data)}`, 'DepartmentController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating department: ${error.message}`, 
        error.stack, 
        'DepartmentController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'DepartmentController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating department';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Department ID' })
  @ApiBody({
    type: UpdateDepartmentGatewayDto,
    examples: {
      example1: {
        summary: 'Update department',
        value: {
          name: 'Software Engineering',
          code: 'DEPT001',
          description: 'Updated Software Engineering Department',
          status: 'ACTIVE'
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentGatewayDto
  ) {
    this.logger.log(`Trying to update department ${id}: ${JSON.stringify(dto)}`, 'DepartmentController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/departments/${id}`, 'DepartmentController');

      const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/departments/${id}`, dto),
      );
      
      this.logger.log(`Department updated successfully: ${JSON.stringify(response.data)}`, 'DepartmentController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating department: ${error.message}`, 
        error.stack, 
        'DepartmentController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'DepartmentController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating department';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Department ID' })
  @ApiOkResponse({
    description: 'Department deleted successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        name: "Engineering",
        code: "DEPT001",
        description: "Software Engineering Department",
        status: "INACTIVE",
        companyId: "00000000000000000000000000000000",
        branchId: "00000000000000000000000000000000",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteDepartment(@Param('id') id: string) {
    this.logger.log(`Trying to delete department ${id}`, 'DepartmentController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/departments/${id}`, 'DepartmentController');
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.coreServiceUrl}/departments/${id}`),
      );
      
      this.logger.log(`Department deleted successfully: ${JSON.stringify(response.data)}`, 'DepartmentController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error deleting department: ${error.message}`, 
        error.stack, 
        'DepartmentController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'DepartmentController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error deleting department';
      throw new HttpException({ message }, status);
    }
  }
} 