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
import { CreateJobTitleGatewayDto } from './dto/create-job-title.dto';
import { UpdateJobTitleGatewayDto } from './dto/update-job-title.dto';

@ApiTags('JobTitle')
@Controller('job-titles')
export class JobTitleController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(JobTitleController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ 
    summary: 'Filter job titles with dynamic filters',
    description: `
This endpoint allows advanced filtering of job titles using query parameters.

How to filter:
- All filters are passed as query parameters.
- You can combine multiple filters (AND logic) by passing several parameters.
- For OR logic, prefix the parameter with or. (e.g., or.name).
- Use operators like eq: (equals), in: (in list), contains, etc.

Supported operators:
- eq: (equals) Example: companyId=eq:123
- in: (in list) Example: branchId=in:123,456
- contains: (contains text) Example: name=contains:Developer
- gte: (greater than or equal) Example: createdAt=gte:2024-01-01

Examples:

Simple filter (AND):
GET /job-titles/filter?companyId=123&branchId=456&name=contains:Developer

Combined filter (AND + OR):
GET /job-titles/filter?companyId=123&or.name=contains:Manager&or.code=contains:MGMT

Example using axios:
axios.get('/job-titles/filter', {
  params: {
    companyId: '123',
    branchId: '456',
    'or.name': 'contains:Developer',
    'or.code': 'contains:DEV',
    page: 1,
    size: 20
  }
});
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered job titles',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            name: "Senior Developer",
            description: "Senior software developer position",
            code: "DEV-SR",
            companyId: "00000000000000000000000000000000",
            branchId: "00000000000000000000000000000000",
            status: "ACTIVE",
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
          applied: '{"$and":[{"companyId":{"$eq":"123"}},{"$or":[{"name":{"$contains":"Developer"}},{"code":{"$contains":"DEV"}}]}]}',
          parsed: {
            $and: [
              { companyId: { $eq: "123" } },
              { $or: [
                { name: { $contains: "Developer" } },
                { code: { $contains: "DEV" } }
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
    description: 'JSON with dynamic filters. See JobTitleFilterDto for all available fields.',
    examples: {
      example1: {
        summary: 'Filter by name and company',
        value: '{"name":"contains:Developer","companyId":"123"}'
      },
      example2: {
        summary: 'Filter by code and branch',
        value: '{"code":"contains:MGMT","branchId":"456"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"name":"contains:Manager","companyId":"123","branchId":"456"}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterJobTitles(@Query() query: Record<string, any>) {
    try {
      // Validate if companyId was provided
      if (!query.companyId) {
        throw new HttpException(
          { message: 'companyId is required to filter job titles' }, 
          HttpStatus.BAD_REQUEST
        );
      }

      console.log('Forwarding params to core-service:', query);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/job-titles/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering job titles';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Create a new job title',
    description: `
Creates a new job title for a specific company and branch.

**Required Fields:**
- name: Job title name
- companyId: Company ID
- branchId: Branch ID

**Optional Fields:**
- description: Job title description
- code: Job title code
    `
  })
  @ApiBody({
    type: CreateJobTitleGatewayDto,
    examples: {
      example1: {
        summary: 'Basic job title creation',
        value: {
          name: 'Senior Developer',
          description: 'Senior software developer position',
          code: 'DEV-SR',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
      example2: {
        summary: 'Minimal job title creation',
        value: {
          name: 'Junior Developer',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
      example3: {
        summary: 'Manager position',
        value: {
          name: 'Project Manager',
          description: 'Manages software development projects',
          code: 'PM',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobTitle(@Body() dto: CreateJobTitleGatewayDto) {
    this.logger.log(`Trying to create job title: ${JSON.stringify(dto)}`, 'JobTitleController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-titles`, 'JobTitleController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/job-titles`, dto),
      );
      
      this.logger.log(`Job title created successfully: ${JSON.stringify(response.data)}`, 'JobTitleController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating job title: ${error.message}`, 
        error.stack, 
        'JobTitleController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating job title';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Update job title',
    description: `
Updates an existing job title.

**Updatable Fields:**
- name: Job title name
- description: Job title description
- code: Job title code
- companyId: Company ID
- branchId: Branch ID
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Job Title ID' })
  @ApiBody({
    type: UpdateJobTitleGatewayDto,
    examples: {
      example1: {
        summary: 'Update job title information',
        value: {
          name: 'Senior Software Engineer',
          description: 'Updated description for senior software engineer',
          code: 'SSE',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000'
        },
      },
      example2: {
        summary: 'Partial update',
        value: {
          name: 'Updated Job Title',
          description: 'New description'
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateJobTitle(
    @Param('id') id: string,
    @Body() dto: UpdateJobTitleGatewayDto
  ) {
    this.logger.log(`Trying to update job title ${id}: ${JSON.stringify(dto)}`, 'JobTitleController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-titles/${id}`, 'JobTitleController');

      const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/job-titles/${id}`, dto),
      );
      
      this.logger.log(`Job title updated successfully: ${JSON.stringify(response.data)}`, 'JobTitleController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating job title: ${error.message}`, 
        error.stack, 
        'JobTitleController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating job title';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Delete job title',
    description: `
Deletes a job title from the system.

This operation permanently removes the job title and cannot be undone.
Make sure no employees are currently assigned to this job title before deletion.
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Job Title ID' })
  @ApiOkResponse({
    description: 'Job title deleted successfully',
    schema: {
      example: {
        message: 'Job title deleted successfully',
        deletedJobTitle: {
          id: "00000000000000000000000000000000",
          name: "Senior Developer",
          description: "Senior software developer position",
          code: "DEV-SR",
          companyId: "00000000000000000000000000000000",
          branchId: "00000000000000000000000000000000",
          status: "DELETED",
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteJobTitle(@Param('id') id: string) {
    this.logger.log(`Trying to delete job title ${id}`, 'JobTitleController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-titles/${id}`, 'JobTitleController');
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.coreServiceUrl}/job-titles/${id}`),
      );
      
      this.logger.log(`Job title deleted successfully: ${JSON.stringify(response.data)}`, 'JobTitleController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error deleting job title: ${error.message}`, 
        error.stack, 
        'JobTitleController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error deleting job title';
      throw new HttpException({ message }, status);
    }
  }
}
