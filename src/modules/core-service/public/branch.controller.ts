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
import { CreateBranchGatewayDto } from '@/dto/create-branch.dto';
import { UpdateBranchGatewayDto } from '@/dto/update-branch.dto';
import { ActionCompanyId } from '@/decorators/action-company-id.decorator';

@ApiTags('Branch')
@Controller('branches')
export class BranchController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(BranchController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
  }

  @ApiOperation({ 
    summary: 'Filter branches with dynamic filters',
    description: `
This endpoint allows advanced filtering of branches using query parameters.

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
GET /branches/filter?status=eq:ACTIVE&isHeadquarter=eq:true

Combined filter (AND + OR):
GET /branches/filter?status=eq:ACTIVE&or.tradingName=eq:Center&or.code=eq:BR001

Example using axios:
axios.get('/branches/filter', {
  params: {
    status: 'eq:ACTIVE',
    'or.tradingName': 'eq:Center',
    'or.code': 'eq:BR001',
    page: 1,
    size: 20
  }
});
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered branches',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            taxId: "12345678000199",
            tradingName: "Branch XPTO",
            legalName: "Branch XPTO LTDA",
            code: "BR001",
            email: "contact@branch.com",
            phone: "+55 11 99999-9999",
            responsible: "John Doe",
            isHeadquarter: true,
            status: "ACTIVE",
            companyId: "00000000000000000000000000000000",
            addressId: "00000000000000000000000000000000",
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
          applied: '{"$and":[{"status":{"$eq":"ACTIVE"}},{"$or":[{"tradingName":{"$eq":"Branch XPTO"}},{"legalName":{"$eq":"Branch XPTO LTDA"}}]}]}',
          parsed: {
            $and: [
              { status: { $eq: "ACTIVE" } },
              { $or: [
                { tradingName: { $eq: "Branch XPTO" } },
                { legalName: { $eq: "Branch XPTO LTDA" } }
              ]}
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
    example: 20
  })
  @ApiQuery({ 
    name: 'filter', 
    required: false, 
    type: String, 
    description: 'JSON with dynamic filters. See BranchFilterDto for all available fields.',
    examples: {
      example1: {
        summary: 'Filter by status and headquarters',
        value: '{"status":"ACTIVE","isHeadquarter":true}'
      },
      example2: {
        summary: 'Filter by name and code',
        value: '{"name":"Center","code":"BR001"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"status":"ACTIVE","isHeadquarter":false,"responsible":"John Doe"}'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async filterBranches(
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
          `${this.coreServiceUrl}/branches/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Error filtering branches';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Create a new branch' })
  @ApiBody({
    type: CreateBranchGatewayDto,
    examples: {
      example1: {
        summary: 'Default example',
        value: {
          taxId: '12345678000199',
          tradingName: 'Center Branch',
          legalName: 'Center Branch LTDA',
          code: 'BR001',
          email: 'contact@branch.com',
          phone: '+55 11 99999-9999',
          responsible: 'John Doe',
          isHeadquarter: false,
          status: 'ACTIVE',
          addressId: '00000000-0000-0000-0000-000000000000'
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBranch(
    @Body() dto: CreateBranchGatewayDto,
    @ActionCompanyId() actionCompanyId: string
  ) {
    this.logger.log(`Trying to create branch: ${JSON.stringify(dto)}`, 'BranchController');
    
    try {
      // Add companyId from JWT token to the payload
      const payload = {
        ...dto,
        companyId: actionCompanyId
      };
      
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/branches`, 'BranchController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/branches`, payload),
      );
      
      this.logger.log(`Branch created successfully: ${JSON.stringify(response.data)}`, 'BranchController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating branch: ${error.message}`, 
        error.stack, 
        'BranchController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'BranchController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating branch';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Update branch' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Branch ID' })
  @ApiBody({
    type: UpdateBranchGatewayDto,
    examples: {
      example1: {
        summary: 'Update example',
        value: {
          taxId: '12345678000199',
          name: 'Updated Center Branch',
          code: 'BR001',
          email: 'newemail@branch.com',
          phone: '+55 11 98888-8888',
          responsible: 'Jane Smith',
          isHeadquarter: false,
          status: 'ACTIVE',
          addressId: '00000000-0000-0000-0000-000000000000'
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateBranch(
    @Param('id') id: string,
    @Body() dto: UpdateBranchGatewayDto
  ) {
    this.logger.log(`Trying to update branch ${id}: ${JSON.stringify(dto)}`, 'BranchController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/branches/${id}`, 'BranchController');

    const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/branches/${id}`, dto),
    );
      
      this.logger.log(`Branch updated successfully: ${JSON.stringify(response.data)}`, 'BranchController');
    return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error updating branch: ${error.message}`, 
        error.stack, 
        'BranchController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'BranchController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating branch';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Delete a branch' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Branch ID' })
  @ApiOkResponse({
    description: 'Branch deleted successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        taxId: "12345678000199",
        name: "Center Branch",
        code: "BR001",
        email: "contact@branch.com",
        phone: "+55 11 99999-9999",
        responsible: "John Doe",
        isHeadquarter: true,
        status: "INACTIVE",
        companyId: "00000000000000000000000000000000",
        addressId: "00000000000000000000000000000000",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteBranch(@Param('id') id: string) {
    this.logger.log(`Trying to soft delete branch ${id}`, 'BranchController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/branches/${id}`, 'BranchController');
      
    const response = await firstValueFrom(
        this.httpService.delete(`${this.coreServiceUrl}/branches/${id}`),
    );
      
      this.logger.log(`Branch set to INACTIVE successfully: ${JSON.stringify(response.data)}`, 'BranchController');
    return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error deleting branch: ${error.message}`, 
        error.stack, 
        'BranchController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'BranchController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error deleting branch';
      throw new HttpException({ message }, status);
    }
  }
} 