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
import { CreateJobTitleLevelGatewayDto } from '@/dto/create-job-title-level.dto';
import { UpdateJobTitleLevelGatewayDto } from '@/dto/update-job-title-level.dto';

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
- Use operators like eq: (equals), in: (in list), etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: status=in:ACTIVE,INACTIVE
- gte: (greater than or equal) Example: salaryMin=gte:5000
- lte: (less than or equal) Example: salaryMax=lte:10000

Examples:

Simple filter (AND):
GET /job-title-levels/filter?jobTitleVersionId=123&status=eq:ACTIVE

Combined filter (AND + OR):
GET /job-title-levels/filter?jobTitleVersionId=123&status=eq:ACTIVE&or.label=contains:Senior&or.rank=gte:3
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
            salaryMin: 8000,
            salaryMax: 12000,
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
        }
      }
    }
  })
  @ApiQuery({ 
    name: 'jobTitleVersionId', 
    required: true, 
    type: String, 
    description: 'Job Title Version ID (required)',
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
        summary: 'Filter by salary range',
        value: '{"salaryMin":{"$gte":5000},"salaryMax":{"$lte":10000}}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"status":"ACTIVE","rank":{"$gte":3}}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterJobTitleLevels(@Query() query: Record<string, any>) {
    try {
      // Validate if jobTitleVersionId was provided
      if (!query.jobTitleVersionId) {
        throw new HttpException(
          { message: 'jobTitleVersionId is required to filter job title levels' }, 
          HttpStatus.BAD_REQUEST
        );
      }

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

  @ApiOperation({ summary: 'Create a new job title level' })
  @ApiBody({
    type: CreateJobTitleLevelGatewayDto,
    examples: {
      example1: {
        summary: 'Basic job title level creation',
        value: {
          jobTitleVersionId: '00000000-0000-0000-0000-000000000000',
          companyId: '00000000-0000-0000-0000-000000000000',
          branchId: '00000000-0000-0000-0000-000000000000',
          label: 'Senior',
          rank: 3,
          salaryMin: 8000,
          salaryMax: 12000,
          status: 'ACTIVE'
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

  @ApiOperation({ summary: 'Update job title level' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Job Title Level ID' })
  @ApiBody({
    type: UpdateJobTitleLevelGatewayDto,
    examples: {
      example1: {
        summary: 'Update job title level',
        value: {
          label: 'Senior+',
          rank: 4,
          salaryMin: 10000,
          salaryMax: 15000,
          status: 'ACTIVE'
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

  @ApiOperation({ summary: 'Delete a job title level' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Job Title Level ID' })
  @ApiOkResponse({
    description: 'Job title level deleted successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        jobTitleVersionId: "00000000000000000000000000000000",
        companyId: "00000000000000000000000000000000",
        branchId: "00000000000000000000000000000000",
        label: "Senior",
        rank: 3,
        salaryMin: 8000,
        salaryMax: 12000,
        status: "INACTIVE",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
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