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
import { CreateJobTitleLevelGatewayDto } from './dto/create-job-title-level.dto';
import { UpdateJobTitleLevelGatewayDto } from './dto/update-job-title-level.dto';

@ApiTags('JobTitleLevel')
@Controller('job-title-levels')
export class JobTitleLevelController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(JobTitleLevelController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ 
    summary: 'Filter job title levels with dynamic filters',
    description: `
This endpoint allows advanced filtering of job title levels using query parameters.

How to filter:
- All filters are passed as query parameters.
- You can combine multiple filters (AND logic) by passing several parameters.
- For OR logic, prefix the parameter with or. (e.g., or.label).
- Use operators like eq: (equals), in: (in list), contains, etc.

Supported operators:
- eq: (equals) Example: companyId=eq:123
- in: (in list) Example: rank=in:1,2,3
- contains: (contains text) Example: label=contains:senior
- gte: (greater than or equal) Example: salaryMin=gte:5000
- lte: (less than or equal) Example: salaryMax=lte:10000

Examples:

Simple filter (AND):
GET /job-title-levels/filter?companyId=123&branchId=456&rank=gte:3

Combined filter (AND + OR):
GET /job-title-levels/filter?companyId=123&or.label=contains:senior&or.label=contains:lead

Example using axios:
axios.get('/job-title-levels/filter', {
  params: {
    companyId: '123',
    branchId: '456',
    'or.label': 'contains:senior',
    'salaryMin': 'gte:5000',
    page: 1,
    size: 20
  }
});
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered job title levels',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            jobTitleVersionId: "00000000000000000000000000000000",
            companyId: "00000000000000000000000000000000",
            branchId: "00000000000000000000000000000000",
            label: "Senior",
            rank: 3,
            salaryMin: 5000,
            salaryMax: 8000,
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
          applied: '{"$and":[{"companyId":{"$eq":"123"}},{"$or":[{"label":{"$contains":"senior"}},{"label":{"$contains":"lead"}}]}]}',
          parsed: {
            $and: [
              { companyId: { $eq: "123" } },
              { $or: [
                { label: { $contains: "senior" } },
                { label: { $contains: "lead" } }
              ]}
            ]
          }
        }
      }
    }
  })
  @ApiQuery({ 
    name: 'companyId', 
    required: false, 
    type: String, 
    description: 'Company ID (optional filter)',
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
    name: 'jobTitleVersionId', 
    required: false, 
    type: String, 
    description: 'Job Title Version ID (optional filter)',
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
    description: 'JSON with dynamic filters. See JobTitleLevelFilterDto for all available fields.',
    examples: {
      example1: {
        summary: 'Filter by company and salary range',
        value: '{"companyId":"123","salaryMin":"gte:5000","salaryMax":"lte:10000"}'
      },
      example2: {
        summary: 'Filter by label and rank',
        value: '{"label":"contains:senior","rank":"gte:3"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"companyId":"123","branchId":"456","label":"contains:lead","salaryMin":"gte:8000"}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterJobTitleLevels(@Query() query: Record<string, any>) {
    try {
      console.log('Forwarding params to core-service:', query);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/job-title-levels/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering job title levels';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Create a new job title level',
    description: `
Creates a new level for a job title version.

**Required Fields:**
- jobTitleVersionId: Job Title Version ID
- companyId: Company ID
- branchId: Branch ID
- label: Level label (e.g., Junior, Senior, Lead)
- rank: Level rank (1-10, higher = higher level)
- salaryMin: Minimum salary
- salaryMax: Maximum salary

**Validation Rules:**
- rank: must be between 1 and 10
- salaryMin: must be >= 0
- salaryMax: must be >= 0
- label: automatic trim
    `
  })
  @ApiBody({
    type: CreateJobTitleLevelGatewayDto,
    examples: {
      example1: {
        summary: 'Basic level creation',
        value: {
          jobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000',
          label: 'Senior',
          rank: 3,
          salaryMin: 5000,
          salaryMax: 8000
        },
      },
      example2: {
        summary: 'Junior level',
        value: {
          jobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000',
          label: 'Junior',
          rank: 1,
          salaryMin: 3000,
          salaryMax: 5000
        },
      },
      example3: {
        summary: 'Lead level with formatting',
        value: {
          jobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000',
          label: '  Lead  ', // Will be trimmed to: Lead
          rank: 4,
          salaryMin: 8000,
          salaryMax: 12000
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobTitleLevel(@Body() dto: CreateJobTitleLevelGatewayDto) {
    this.logger.log(`Trying to create job title level: ${JSON.stringify(dto)}`, 'JobTitleLevelController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-title-levels`, 'JobTitleLevelController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/job-title-levels`, dto),
      );
      
      this.logger.log(`Job title level created successfully: ${JSON.stringify(response.data)}`, 'JobTitleLevelController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating job title level: ${error.message}`, 
        error.stack, 
        'JobTitleLevelController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleLevelController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating job title level';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Update job title level',
    description: `
Updates an existing job title level.

**Updatable Fields:**
- jobTitleVersionId: Job Title Version ID
- companyId: Company ID
- branchId: Branch ID
- label: Level label
- rank: Level rank (1-10)
- salaryMin: Minimum salary
- salaryMax: Maximum salary

**Validation Rules:**
- rank: must be between 1 and 10
- salaryMin: must be >= 0
- salaryMax: must be >= 0
- label: automatic trim
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Job Title Level ID' })
  @ApiBody({
    type: UpdateJobTitleLevelGatewayDto,
    examples: {
      example1: {
        summary: 'Update level information',
        value: {
          label: 'Lead',
          rank: 4,
          salaryMin: 8000,
          salaryMax: 12000
        },
      },
      example2: {
        summary: 'Partial update - salary only',
        value: {
          salaryMin: 6000,
          salaryMax: 10000
        },
      },
      example3: {
        summary: 'Update with formatting',
        value: {
          label: '  Senior Lead  ', // Will be trimmed to: Senior Lead
          rank: 5,
          salaryMin: 10000,
          salaryMax: 15000
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateJobTitleLevel(
    @Param('id') id: string,
    @Body() dto: UpdateJobTitleLevelGatewayDto
  ) {
    this.logger.log(`Trying to update job title level ${id}: ${JSON.stringify(dto)}`, 'JobTitleLevelController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-title-levels/${id}`, 'JobTitleLevelController');

      const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/job-title-levels/${id}`, dto),
      );
      
      this.logger.log(`Job title level updated successfully: ${JSON.stringify(response.data)}`, 'JobTitleLevelController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating job title level: ${error.message}`, 
        error.stack, 
        'JobTitleLevelController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleLevelController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating job title level';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Delete job title level',
    description: `
Deletes a job title level from the system.

This operation permanently removes the job title level and cannot be undone.
Make sure no employees are currently assigned to this level before deletion.
    `
  })
  @ApiParam({ name: 'id', type: String, example: '00000000-0000-0000-0000-000000000000', description: 'Job Title Level ID' })
  @ApiOkResponse({
    description: 'Job title level deleted successfully',
    schema: {
      example: {
        message: 'Job title level deleted successfully',
        deletedJobTitleLevel: {
          id: "00000000000000000000000000000000",
          jobTitleVersionId: "00000000000000000000000000000000",
          companyId: "00000000000000000000000000000000",
          branchId: "00000000000000000000000000000000",
          label: "Senior",
          rank: 3,
          salaryMin: 5000,
          salaryMax: 8000,
          status: "DELETED",
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteJobTitleLevel(@Param('id') id: string) {
    this.logger.log(`Trying to delete job title level ${id}`, 'JobTitleLevelController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-title-levels/${id}`, 'JobTitleLevelController');
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.coreServiceUrl}/job-title-levels/${id}`),
      );
      
      this.logger.log(`Job title level deleted successfully: ${JSON.stringify(response.data)}`, 'JobTitleLevelController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error deleting job title level: ${error.message}`, 
        error.stack, 
        'JobTitleLevelController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleLevelController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error deleting job title level';
      throw new HttpException({ message }, status);
    }
  }
}

