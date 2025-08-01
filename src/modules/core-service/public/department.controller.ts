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
import { ApiOperation, ApiTags, ApiParam, ApiBody, ApiQuery, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { CreateDepartmentGatewayDto } from '@/dto/create-department.dto';
import { UpdateDepartmentGatewayDto } from '@/dto/update-department.dto';
import { ActionCompanyId } from '@/decorators/action-company-id.decorator';

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
GET /departments/filter?status=eq:ACTIVE

Combined filter (AND + OR):
GET /departments/filter?status=eq:ACTIVE&or.name=contains:Engineering&or.code=eq:DEPT001
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
  async filterDepartments(
    @Query() query: Record<string, any>,
    @ActionCompanyId() actionCompanyId: string
  ) {
    try {
      // Use actionCompanyId from JWT token if companyId not provided in query
      if (!query.companyId) {
        query.companyId = actionCompanyId;
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

  @ApiOperation({ 
    summary: 'Create a new department',
    description: `
Creates a new department for the authenticated company.

**Required fields:**
- name: Department name (minimum 3 characters)
- status: Department status (ACTIVE, INACTIVE, SUSPENDED, OBSOLETE)
- branchId: ID of the branch this department belongs to

**Optional fields:**
- description: Department description
- code: Department code (minimum 3 characters)
- responsibleName: Name of the person responsible
- responsibleEmail: Email of the person responsible

**Features:**
- Automatically associates the department with the company from JWT token
- Validates all required fields
- Returns complete department information including generated ID and timestamps
    `
  })
  @ApiCreatedResponse({
    description: 'Department created successfully',
    schema: {
      example: {
        id: "cmdqujqbe0007i0is1q0qk0os",
        name: "Engineering",
        description: "Software Engineering Department",
        status: "ACTIVE",
        branchId: "cmdqtvliz0005i0isxzsqes2x",
        createdAt: "2025-07-31T03:40:10.094Z",
        updatedAt: "2025-07-31T03:40:10.094Z"
      }
    }
  })
  @ApiBody({
    type: CreateDepartmentGatewayDto,
    examples: {
      example1: {
        summary: 'Basic department creation',
        value: {
          name: 'Engineering',
          code: 'DEPT001',
          description: 'Software Engineering Department',
          responsibleName: 'John Doe',
          responsibleEmail: 'john.doe@company.com',
          status: 'ACTIVE',
          branchId: 'cmdqtvliz0005i0isxzsqes2x'
        },
      },
      example2: {
        summary: 'Minimal department creation',
        value: {
          name: 'Finance',
          status: 'ACTIVE',
          branchId: 'cmdqtvliz0005i0isxzsqes2x'
        },
      },
      example3: {
        summary: 'Department with all fields',
        value: {
          name: 'Human Resources',
          code: 'HR001',
          description: 'Human Resources Department',
          responsibleName: 'Jane Smith',
          responsibleEmail: 'jane.smith@company.com',
          status: 'ACTIVE',
          branchId: 'cmdqtvliz0005i0isxzsqes2x'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(
    @Body() dto: CreateDepartmentGatewayDto,
    @ActionCompanyId() actionCompanyId: string
  ) {
    this.logger.log(`Trying to create department: ${JSON.stringify(dto)}`, 'DepartmentController');
    
    try {
      // Add companyId from JWT token to the payload
      const payload = {
        ...dto,
        companyId: actionCompanyId
      };
      
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/departments`, 'DepartmentController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/departments`, payload),
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

  @ApiOperation({ 
    summary: 'Update department',
    description: `
Updates an existing department with the provided data.

**Features:**
- Validates all fields before updating
- Returns complete updated department information
- Maintains audit trail with updatedAt timestamp
    `
  })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Department ID' })
  @ApiOkResponse({
    description: 'Department updated successfully',
    schema: {
      example: {
        id: "cmdqujqbe0007i0is1q0qk0os",
        name: "Software Engineering",
        description: "Updated Software Engineering Department",
        status: "ACTIVE",
        branchId: "cmdqtvliz0005i0isxzsqes2x",
        createdAt: "2025-07-31T03:40:10.094Z",
        updatedAt: "2025-07-31T03:42:15.123Z"
      }
    }
  })
  @ApiBody({
    type: UpdateDepartmentGatewayDto,
    examples: {
      example1: {
        summary: 'Update department',
        value: {
          name: 'Software Engineering',
          code: 'DEPT001',
          description: 'Updated Software Engineering Department',
          responsibleName: 'John Doe',
          responsibleEmail: 'john.doe@company.com',
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

  @ApiOperation({ 
    summary: 'Delete a department',
    description: `
Soft deletes a department by setting its status to INACTIVE.

**Features:**
- Performs soft delete (sets status to INACTIVE)
- Returns the updated department information
- Maintains data integrity and audit trail
    `
  })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Department ID' })
  @ApiOkResponse({
    description: 'Department deleted successfully (soft delete)',
    schema: {
      example: {
        id: "cmdqujqbe0007i0is1q0qk0os",
        name: "Engineering",
        description: "Software Engineering Department",
        status: "INACTIVE",
        branchId: "cmdqtvliz0005i0isxzsqes2x",
        createdAt: "2025-07-31T03:40:10.094Z",
        updatedAt: "2025-07-31T03:45:10.456Z"
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