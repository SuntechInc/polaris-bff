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
  Patch,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiParam, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { CreateEmployeeGatewayDto } from '@/dto/create-employee.dto';
import { UpdateEmployeeGatewayDto } from '@/dto/update-employee.dto';
import { UpdateEmployeeStatusGatewayDto } from '@/dto/update-employee-status.dto';

@ApiTags('Employee')
@Controller('employees')
export class EmployeeController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(EmployeeController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ 
    summary: 'Filter employees with dynamic filters',
    description: `
This endpoint allows advanced filtering of employees using query parameters.

How to filter:
- All filters are passed as query parameters.
- You can combine multiple filters (AND logic) by passing several parameters.
- For OR logic, prefix the parameter with or. (e.g., or.name).
- Use operators like eq: (equals), in: (in list), etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: status=in:ACTIVE,INACTIVE
- contains: (contains text) Example: name=contains:João
- gte: (greater than or equal) Example: hiredAt=gte:2024-01-01

Examples:

Simple filter (AND):
GET /employees/filter?companyId=123&status=eq:ACTIVE

Combined filter (AND + OR):
GET /employees/filter?companyId=123&status=eq:ACTIVE&or.name=contains:João&or.email=contains:joao@company.com
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered employees',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            name: "João Silva",
            email: "joao.silva@company.com",
            phone: "+55 11 99999-9999",
            departmentId: "00000000000000000000000000000000",
            currentJobTitleVersionId: "00000000000000000000000000000000",
            employmentType: "FULL_TIME",
            status: "ACTIVE",
            hiredAt: "2024-01-15T00:00:00.000Z",
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
        summary: 'Filter by employment type',
        value: '{"employmentType":"FULL_TIME"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"status":"ACTIVE","employmentType":"FULL_TIME"}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterEmployees(@Query() query: Record<string, any>) {
    try {
      // Validate if companyId was provided
      if (!query.companyId) {
        throw new HttpException(
          { message: 'companyId is required to filter employees' }, 
          HttpStatus.BAD_REQUEST
        );
      }

      console.log('Forwarding params to core-service:', query);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/employees/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering employees';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Create a new employee' })
  @ApiBody({
    type: CreateEmployeeGatewayDto,
    examples: {
      example1: {
        summary: 'Basic employee creation',
        value: {
          name: 'João Silva',
          email: 'joao.silva@company.com',
          phone: '+55 11 99999-9999',
          departmentId: '00000000-0000-0000-0000-000000000000',
          currentJobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
          hiredAt: '2024-01-15T00:00:00.000Z',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(@Body() dto: CreateEmployeeGatewayDto) {
    this.logger.log(`Trying to create employee: ${JSON.stringify(dto)}`, 'EmployeeController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/employees`, 'EmployeeController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/employees`, dto),
      );
      
      this.logger.log(`Employee created successfully: ${JSON.stringify(response.data)}`, 'EmployeeController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating employee: ${error.message}`, 
        error.stack, 
        'EmployeeController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'EmployeeController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating employee';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Employee ID' })
  @ApiBody({
    type: UpdateEmployeeGatewayDto,
    examples: {
      example1: {
        summary: 'Update employee',
        value: {
          name: 'João Silva Santos',
          email: 'joao.silva.santos@company.com',
          phone: '+55 11 98888-8888',
          departmentId: '00000000-0000-0000-0000-000000000000',
          currentJobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          employmentType: 'FULL_TIME',
          status: 'ACTIVE'
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeGatewayDto
  ) {
    this.logger.log(`Trying to update employee ${id}: ${JSON.stringify(dto)}`, 'EmployeeController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/employees/${id}`, 'EmployeeController');

      const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/employees/${id}`, dto),
      );
      
      this.logger.log(`Employee updated successfully: ${JSON.stringify(response.data)}`, 'EmployeeController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating employee: ${error.message}`, 
        error.stack, 
        'EmployeeController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'EmployeeController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating employee';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Update employee status' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Employee ID' })
  @ApiBody({
    type: UpdateEmployeeStatusGatewayDto,
    examples: {
      example1: {
        summary: 'Update employee status',
        value: {
          status: 'ACTIVE'
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Employee status updated successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        name: "João Silva",
        email: "joao.silva@company.com",
        phone: "+55 11 99999-9999",
        departmentId: "00000000000000000000000000000000",
        currentJobTitleVersionId: "00000000000000000000000000000000",
        employmentType: "FULL_TIME",
        status: "ACTIVE",
        hiredAt: "2024-01-15T00:00:00.000Z",
        branchId: "00000000000000000000000000000000",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  async updateEmployeeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeStatusGatewayDto
  ) {
    this.logger.log(`Trying to update employee status ${id}: ${JSON.stringify(dto)}`, 'EmployeeController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/employees/${id}/status`, 'EmployeeController');

      const response = await firstValueFrom(
        this.httpService.patch(`${this.coreServiceUrl}/employees/${id}/status`, dto),
      );
      
      this.logger.log(`Employee status updated successfully: ${JSON.stringify(response.data)}`, 'EmployeeController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating employee status: ${error.message}`, 
        error.stack, 
        'EmployeeController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'EmployeeController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating employee status';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Delete an employee' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Employee ID' })
  @ApiOkResponse({
    description: 'Employee deleted successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        name: "João Silva",
        email: "joao.silva@company.com",
        phone: "+55 11 99999-9999",
        departmentId: "00000000000000000000000000000000",
        currentJobTitleVersionId: "00000000000000000000000000000000",
        employmentType: "FULL_TIME",
        status: "TERMINATED",
        hiredAt: "2024-01-15T00:00:00.000Z",
        leftAt: "2024-12-31T00:00:00.000Z",
        branchId: "00000000000000000000000000000000",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    this.logger.log(`Trying to delete employee ${id}`, 'EmployeeController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/employees/${id}`, 'EmployeeController');
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.coreServiceUrl}/employees/${id}`),
      );
      
      this.logger.log(`Employee deleted successfully: ${JSON.stringify(response.data)}`, 'EmployeeController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error deleting employee: ${error.message}`, 
        error.stack, 
        'EmployeeController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'EmployeeController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error deleting employee';
      throw new HttpException({ message }, status);
    }
  }
} 