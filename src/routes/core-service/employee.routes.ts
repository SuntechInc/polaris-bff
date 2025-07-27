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
import { CreateEmployeeGatewayDto } from './dto/create-employee.dto';
import { UpdateEmployeeGatewayDto } from './dto/update-employee.dto';
import { UpdateEmployeeStatusGatewayDto } from './dto/update-employee-status.dto';

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
- Use operators like eq: (equals), in: (in list), contains, etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: employmentType=in:FULL_TIME,PART_TIME
- contains: (contains text) Example: name=contains:João
- gte: (greater than or equal) Example: hiredAt=gte:2024-01-01
- lte: (less than or equal) Example: leftAt=lte:2024-12-31

Examples:

Simple filter (AND):
GET /employees/filter?companyId=123&status=eq:ACTIVE&employmentType=eq:FULL_TIME

Combined filter (AND + OR):
GET /employees/filter?companyId=123&or.name=contains:João&or.name=contains:Maria

Example using axios:
axios.get('/employees/filter', {
  params: {
    companyId: '123',
    branchId: '456',
    'or.name': 'contains:João',
    'status': 'eq:ACTIVE',
    page: 1,
    size: 20
  }
});
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
            leftAt: null,
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
        },
        filter: {
          applied: '{"$and":[{"companyId":{"$eq":"123"}},{"$or":[{"name":{"$contains":"João"}},{"name":{"$contains":"Maria"}}]}]}',
          parsed: {
            $and: [
              { companyId: { $eq: "123" } },
              { $or: [
                { name: { $contains: "João" } },
                { name: { $contains: "Maria" } }
              ]}
            ]
          }
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
    name: 'branchId', 
    required: false, 
    type: String, 
    description: 'Branch ID (optional filter)',
    example: '00000000-0000-0000-0000-000000000000'
  })
  @ApiQuery({ 
    name: 'departmentId', 
    required: false, 
    type: String, 
    description: 'Department ID (optional filter)',
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
    description: 'Number of items per page (default: 20, max: 1000)',
    example: 20
  })
  @ApiQuery({ 
    name: 'filter', 
    required: false, 
    type: String, 
    description: 'JSON with dynamic filters. See EmployeeFilterDto for all available fields.',
    examples: {
      example1: {
        summary: 'Filter by status and employment type',
        value: '{"status":"ACTIVE","employmentType":"FULL_TIME"}'
      },
      example2: {
        summary: 'Filter by name and email',
        value: '{"name":"contains:João","email":"contains:joao@company.com"}'
      },
      example3: {
        summary: 'Filter by hire date range',
        value: '{"hiredAt":"gte:2024-01-01","hiredAt":"lte:2024-12-31"}'
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

  @ApiOperation({ 
    summary: 'Create a new employee',
    description: `
Creates a new employee in the system.

**Required Fields:**
- name: Employee full name
- email: Employee email (must be unique)
- phone: Employee phone number
- departmentId: Department ID
- currentJobTitleVersionId: Current Job Title Version ID
- hiredAt: Hire date
- branchId: Branch ID

**Optional Fields:**
- employmentType: Employment type (default: FULL_TIME)
- status: Employee status (default: ACTIVE)
- leftAt: Leave date

**Validation Rules:**
- email: must be valid format and unique
- hiredAt: must be valid date format
- leftAt: must be valid date format (if provided)
- name, phone: automatic trim
- email: automatic lowercase and trim
    `
  })
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
      example2: {
        summary: 'Part-time employee',
        value: {
          name: 'Maria Santos',
          email: 'maria.santos@company.com',
          phone: '+55 11 98888-8888',
          departmentId: '00000000-0000-0000-0000-000000000000',
          currentJobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          employmentType: 'PART_TIME',
          status: 'ACTIVE',
          hiredAt: '2024-02-01T00:00:00.000Z',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
      example3: {
        summary: 'Intern with formatting',
        value: {
          name: '  Pedro Costa  ', // Will be trimmed to: Pedro Costa
          email: '  PEDRO.COSTA@COMPANY.COM  ', // Will be trimmed and lowercased to: pedro.costa@company.com
          phone: '  +55 11 97777-7777  ', // Will be trimmed to: +55 11 97777-7777
          departmentId: '00000000-0000-0000-0000-000000000000',
          currentJobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          employmentType: 'INTERN',
          status: 'ACTIVE',
          hiredAt: '2024-03-01T00:00:00.000Z',
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

  @ApiOperation({ 
    summary: 'Update employee',
    description: `
Updates an existing employee's information.

**Updatable Fields:**
- name: Employee full name
- email: Employee email (must be unique)
- phone: Employee phone number
- departmentId: Department ID
- currentJobTitleVersionId: Current Job Title Version ID
- employmentType: Employment type
- status: Employee status
- hiredAt: Hire date
- leftAt: Leave date
- branchId: Branch ID

**Validation Rules:**
- email: must be valid format and unique
- hiredAt/leftAt: must be valid date format
- name, phone: automatic trim
- email: automatic lowercase and trim
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Employee ID' })
  @ApiBody({
    type: UpdateEmployeeGatewayDto,
    examples: {
      example1: {
        summary: 'Update employee information',
        value: {
          name: 'João Silva Santos',
          email: 'joao.silva.santos@company.com',
          phone: '+55 11 98888-8888',
          employmentType: 'FULL_TIME',
          status: 'ACTIVE'
        },
      },
      example2: {
        summary: 'Partial update - contact only',
        value: {
          email: 'joao.silva@newcompany.com',
          phone: '+55 11 97777-7777'
        },
      },
      example3: {
        summary: 'Update with formatting',
        value: {
          name: '  João Silva Santos  ', // Will be trimmed to: João Silva Santos
          email: '  JOAO.SILVA@NEWCOMPANY.COM  ', // Will be trimmed and lowercased to: joao.silva@newcompany.com
          phone: '  +55 11 96666-6666  ', // Will be trimmed to: +55 11 96666-6666
          status: 'ON_LEAVE'
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

  @ApiOperation({ 
    summary: 'Update employee status only',
    description: `
Updates only the status of an employee.

This endpoint is useful for quick status changes like:
- Setting employee to ON_LEAVE
- Activating/Deactivating employee
- Terminating employee

**Available Statuses:**
- IN_PROCESS: Employee in process
- ACTIVE: Active employee
- ON_LEAVE: Employee on leave
- SUSPENDED: Suspended employee
- TERMINATED: Terminated employee
- OBSOLETE: Obsolete employee
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Employee ID' })
  @ApiBody({
    type: UpdateEmployeeStatusGatewayDto,
    examples: {
      example1: {
        summary: 'Set employee to active',
        value: {
          status: 'ACTIVE'
        },
      },
      example2: {
        summary: 'Set employee on leave',
        value: {
          status: 'ON_LEAVE'
        },
      },
      example3: {
        summary: 'Terminate employee',
        value: {
          status: 'TERMINATED'
        },
      },
    },
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

  @ApiOperation({ 
    summary: 'Delete employee',
    description: `
Deletes an employee from the system.

This operation permanently removes the employee and cannot be undone.
Make sure to handle any related data (job history, etc.) before deletion.
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Employee ID' })
  @ApiOkResponse({
    description: 'Employee deleted successfully',
    schema: {
      example: {
        message: 'Employee deleted successfully',
        deletedEmployee: {
          id: "00000000000000000000000000000000",
          name: "João Silva",
          email: "joao.silva@company.com",
          phone: "+55 11 99999-9999",
          departmentId: "00000000000000000000000000000000",
          currentJobTitleVersionId: "00000000000000000000000000000000",
          employmentType: "FULL_TIME",
          status: "DELETED",
          hiredAt: "2024-01-15T00:00:00.000Z",
          leftAt: null,
          branchId: "00000000000000000000000000000000",
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        }
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

