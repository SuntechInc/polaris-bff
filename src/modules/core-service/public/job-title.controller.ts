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
import { CreateJobTitleGatewayDto } from '@/dto/create-job-title.dto';
import { UpdateJobTitleGatewayDto } from '@/dto/update-job-title.dto';

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
- Use operators like eq: (equals), in: (in list), etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: status=in:ACTIVE,INACTIVE
- contains: (contains text) Example: name=contains:Manager

Examples:

Simple filter (AND):
GET /job-titles/filter?companyId=123&status=eq:ACTIVE

Combined filter (AND + OR):
GET /job-titles/filter?companyId=123&status=eq:ACTIVE&or.name=contains:Manager&or.description=contains:Senior
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered job titles',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            name: "Software Engineer",
            description: "Develops software applications",
            status: "ACTIVE",
            companyId: "00000000000000000000000000000000",
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
        value: '{"name":"Engineer"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"status":"ACTIVE","name":"Manager"}'
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

  @ApiOperation({ summary: 'Create a new job title' })
  @ApiBody({
    type: CreateJobTitleGatewayDto,
    examples: {
      example1: {
        summary: 'Basic job title creation',
        value: {
          name: 'Software Engineer',
          description: 'Develops software applications',
          status: 'ACTIVE',
          companyId: '00000000-0000-0000-0000-000000000000'
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

  @ApiOperation({ summary: 'Update job title' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Job Title ID' })
  @ApiBody({
    type: UpdateJobTitleGatewayDto,
    examples: {
      example1: {
        summary: 'Update job title',
        value: {
          name: 'Senior Software Engineer',
          description: 'Develops complex software applications',
          status: 'ACTIVE'
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

  @ApiOperation({ summary: 'Delete a job title' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Job Title ID' })
  @ApiOkResponse({
    description: 'Job title deleted successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        name: "Software Engineer",
        description: "Develops software applications",
        status: "INACTIVE",
        companyId: "00000000000000000000000000000000",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
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