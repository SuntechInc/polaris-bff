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
import { CreateJobTitleVersionGatewayDto } from '@/dto/create-job-title-version.dto';
import { UpdateJobTitleVersionGatewayDto } from '@/dto/update-job-title-version.dto';

@ApiTags('JobTitleVersion')
@Controller('job-title-versions')
export class JobTitleVersionController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(JobTitleVersionController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ 
    summary: 'Filter job title versions with dynamic filters',
    description: `
This endpoint allows advanced filtering of job title versions using query parameters.

How to filter:
- All filters are passed as query parameters.
- You can combine multiple filters (AND logic) by passing several parameters.
- For OR logic, prefix the parameter with or. (e.g., or.version).
- Use operators like eq: (equals), in: (in list), etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: status=in:ACTIVE,INACTIVE
- contains: (contains text) Example: description=contains:Senior

Examples:

Simple filter (AND):
GET /job-title-versions/filter?jobTitleId=123&status=eq:ACTIVE

Combined filter (AND + OR):
GET /job-title-versions/filter?jobTitleId=123&status=eq:ACTIVE&or.version=eq:2&or.description=contains:Senior
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered job title versions',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            jobTitleId: "00000000000000000000000000000000",
            version: 1,
            description: "Senior Software Engineer",
            responsibilities: ["Code review", "Mentoring"],
            requirements: ["5+ years experience", "React knowledge"],
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
    name: 'jobTitleId', 
    required: true, 
    type: String, 
    description: 'Job Title ID (required)',
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
        summary: 'Filter by version',
        value: '{"version":1}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"status":"ACTIVE","version":2}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterJobTitleVersions(@Query() query: Record<string, any>) {
    try {
      // Validate if jobTitleId was provided
      if (!query.jobTitleId) {
        throw new HttpException(
          { message: 'jobTitleId is required to filter job title versions' }, 
          HttpStatus.BAD_REQUEST
        );
      }

      console.log('Forwarding params to core-service:', query);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/job-title-versions/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering job title versions';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Create a new job title version' })
  @ApiBody({
    type: CreateJobTitleVersionGatewayDto,
    examples: {
      example1: {
        summary: 'Basic job title version creation',
        value: {
          jobTitleId: '00000000-0000-0000-0000-000000000000',
          version: 1,
          description: 'Senior Software Engineer',
          responsibilities: ['Code review', 'Mentoring'],
          requirements: ['5+ years experience', 'React knowledge'],
          status: 'ACTIVE'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobTitleVersion(@Body() dto: CreateJobTitleVersionGatewayDto) {
    this.logger.log(`Trying to create job title version: ${JSON.stringify(dto)}`, 'JobTitleVersionController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-title-versions`, 'JobTitleVersionController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/job-title-versions`, dto),
      );
      
      this.logger.log(`Job title version created successfully: ${JSON.stringify(response.data)}`, 'JobTitleVersionController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating job title version: ${error.message}`, 
        error.stack, 
        'JobTitleVersionController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleVersionController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating job title version';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Update job title version' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Job Title Version ID' })
  @ApiBody({
    type: UpdateJobTitleVersionGatewayDto,
    examples: {
      example1: {
        summary: 'Update job title version',
        value: {
          version: 2,
          description: 'Senior Software Engineer v2',
          responsibilities: ['Code review', 'Mentoring', 'Architecture'],
          requirements: ['7+ years experience', 'React knowledge', 'System design'],
          status: 'ACTIVE'
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateJobTitleVersion(
    @Param('id') id: string,
    @Body() dto: UpdateJobTitleVersionGatewayDto
  ) {
    this.logger.log(`Trying to update job title version ${id}: ${JSON.stringify(dto)}`, 'JobTitleVersionController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-title-versions/${id}`, 'JobTitleVersionController');

      const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/job-title-versions/${id}`, dto),
      );
      
      this.logger.log(`Job title version updated successfully: ${JSON.stringify(response.data)}`, 'JobTitleVersionController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating job title version: ${error.message}`, 
        error.stack, 
        'JobTitleVersionController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleVersionController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating job title version';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Delete a job title version' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Job Title Version ID' })
  @ApiOkResponse({
    description: 'Job title version deleted successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        jobTitleId: "00000000000000000000000000000000",
        version: 1,
        description: "Senior Software Engineer",
        responsibilities: ["Code review", "Mentoring"],
        requirements: ["5+ years experience", "React knowledge"],
        status: "INACTIVE",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteJobTitleVersion(@Param('id') id: string) {
    this.logger.log(`Trying to delete job title version ${id}`, 'JobTitleVersionController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/job-title-versions/${id}`, 'JobTitleVersionController');
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.coreServiceUrl}/job-title-versions/${id}`),
      );
      
      this.logger.log(`Job title version deleted successfully: ${JSON.stringify(response.data)}`, 'JobTitleVersionController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error deleting job title version: ${error.message}`, 
        error.stack, 
        'JobTitleVersionController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'JobTitleVersionController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error deleting job title version';
      throw new HttpException({ message }, status);
    }
  }
} 