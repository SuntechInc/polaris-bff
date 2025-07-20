import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Param,
  HttpException,
  Put,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateCompanyGatewayDto } from './dto/create-company.dto';
import { ApiBody, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('Company')
@Controller()
export class CompanyController {
  private readonly coreServiceUrl: string;

  private readonly logger = new Logger(CompanyController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
    this.logger.log(`Core Service URL configurada: ${this.coreServiceUrl}`, 'CompanyController');
  }

  @ApiOperation({ 
    summary: 'Filter companies with dynamic filters - GLOBAL_ADMIN only',
    description: `
This endpoint allows advanced filtering of companies using query parameters.

How to filter:
- All filters are passed as query parameters.
- You can combine multiple filters (AND logic) by passing several parameters.
- For OR logic, prefix the parameter with or. (e.g., or.tradingName).
- Use operators like eq: (equals), in: (in list), etc.

Supported operators:
- eq: (equals) Example: status=eq:ACTIVE
- in: (in list) Example: industry=in:TECHNOLOGY,HEALTHCORE

Examples:

Simple filter (AND):
GET /companies/filter?status=eq:ACTIVE&segment=eq:HOSPITAL

Combined filter (AND + OR):
GET /companies/filter?status=eq:ACTIVE&or.tradingName=eq:Quail&or.legalName=eq:Suntech

Example using axios:
axios.get('/companies/filter', {
  params: {
    status: 'eq:ACTIVE',
    'or.tradingName': 'eq:Quail',
    'or.legalName': 'eq:Suntech',
    page: 1,
    size: 20
  }
});
    `
  })
  @ApiOkResponse({
    description: 'Successful response with filtered companies',
    schema: {
      example: {
        data: [
          {
            id: "00000000000000000000000000000000",
            tradingName: "Empresa XPTO",
            legalName: "Empresa XPTO LTDA",
            taxId: "00000000000000",
            taxCountry: "BR",
            email: "financeiro@empresa.com.br",
            phone: "0000000000",
            industry: "TECHNOLOGY",
            segment: "HOSPITAL",
            status: "ACTIVE",
            isBaseCompany: true,
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
          applied: '{"$and":[{"status":{"$eq":"ACTIVE"}},{"$or":[{"tradingName":{"$eq":"Empresa XPTO"}},{"legalName":{"$eq":"Empresa XPTO LTDA"}}]}]}',
          parsed: {
            $and: [
              { status: { $eq: "ACTIVE" } },
              { $or: [
                { tradingName: { $eq: "Empresa XPTO" } },
                { legalName: { $eq: "Empresa XPTO LTDA" } }
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
    description: 'Number of items per page (default: 20)',
    example: 20
  })
  @ApiQuery({ 
    name: 'filter', 
    required: false, 
    type: String, 
    description: 'JSON with dynamic filters. See CompanyFilterDto for all available fields.',
    examples: {
      example1: {
        summary: 'Filter by name and status',
        value: '{"tradingName":"Test Company","status":"ACTIVE"}'
      },
      example2: {
        summary: 'Filter by segment and industry',
        value: '{"segment":"HOSPITAL","industry":"HEALTHCORE"}'
      },
      example3: {
        summary: 'Multiple filters',
        value: '{"tradingName":"Company","status":"ACTIVE","segment":"HOSPITAL","industry":"TECHNOLOGY"}'
      }
    }
  })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Get('companies/filter')
  async filterCompanies(@Query() query: Record<string, any>) {

    try {
      console.log('Encaminhando params para core-service:', query);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.coreServiceUrl}/companies/filter`,
          { params: query },
        ),
      );
      return response.data;
    } catch (error: any) {
      const status  = error.response?.status  ?? HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message ?? 'Erro ao filtrar empresas';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Create a new company - Apenas GLOBAL_ADMIN' })
  @UseGuards(AdminGuard)

  @ApiBody({
    type: CreateCompanyGatewayDto,
    examples: {
      example1: {
        summary: 'Exemplo padrão',
        value: {
          tradingName: 'Empresa XPTO',
          legalName: 'Empresa XPTO LTDA',
          taxId: '12345678000199',
          email: 'contato@empresa.com',
          phone: '+55 11 99999-9999',
          industry: 'HEALTHCORE',
          segment: 'LABORATORY',
          isActive: true,
        },
      },
    },
  })
  @Post('company')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() dto: CreateCompanyGatewayDto) {
    this.logger.log(`Tentando criar empresa: ${JSON.stringify(dto)}`, 'CompanyController');
    
    try {
      this.logger.log(`Enviando requisição para: ${this.coreServiceUrl}/companies`, 'CompanyController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/companies`, dto),
      );
      
      this.logger.log(`Empresa criada com sucesso: ${JSON.stringify(response.data)}`, 'CompanyController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao criar empresa: ${error.message}`, 
        error.stack, 
        'CompanyController'
      );
      
      if (error.response) {
        this.logger.error(
          `Resposta do core service: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error creating company';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Atualizar empresa - Apenas GLOBAL_ADMIN' })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'ID da empresa' })
  @ApiBody({
    type: CreateCompanyGatewayDto,
    examples: {
      example1: {
        summary: 'Exemplo de atualização',
        value: {
          tradingName: 'Empresa Atualizada',
          legalName: 'Empresa Atualizada LTDA',
          taxId: '12345678000199',
          email: 'novoemail@empresa.com',
          phone: '+55 11 98888-8888',
          industry: 'HEALTHCORE',
          segment: 'LABORATORY',
          isActive: true,
        },
      },
    },
  })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Put('companies/:id')
  async updateCompany(
    @Param('id') id: string,
    @Body() dto: CreateCompanyGatewayDto
  ) {
    try {
      const coreResponse = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/companies/${id}`, dto)
      );
      return coreResponse.data;
    } catch (error: any) {
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error updating company';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'List available modules - GLOBAL_ADMIN only' })
  @ApiOkResponse({
    description: 'List of available modules',
    schema: {
      example: [
        {
          id: "00000000000000000000000000000000",
          name: "Financial Module",
          description: "Module for financial management",
          isActive: true,
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        }
      ]
    }
  })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Get('companies/modules')
  async listModules() {
    this.logger.log('Listing available modules...', 'CompanyController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/companies/modules`, 'CompanyController');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/companies/modules`)
      );
      
      this.logger.log(`Modules listed successfully: ${JSON.stringify(response.data)}`, 'CompanyController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error listing modules: ${error.message}`, 
        error.stack, 
        'CompanyController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error listing modules';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'List company modules - GLOBAL_ADMIN only' })
  @ApiParam({ name: 'companyId', type: String, example: '123', description: 'Company ID' })
  @ApiOkResponse({
    description: 'List of company modules',
    schema: {
      example: [
        {
          id: "00000000000000000000000000000000",
          moduleId: "00000000000000000000000000000001",
          moduleName: "Financial Module",
          moduleDescription: "Module for financial management",
          isActive: true,
          enabledAt: "2025-06-23T23:32:29.601Z",
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        }
      ]
    }
  })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Get('companies/:companyId/modules')
  async listCompanyModules(@Param('companyId') companyId: string) {
    this.logger.log(`Listing modules for company: ${companyId}`, 'CompanyController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/companies/${companyId}/modules`, 'CompanyController');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/companies/${companyId}/modules`)
      );
      
      this.logger.log(`Company modules listed successfully: ${JSON.stringify(response.data)}`, 'CompanyController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error listing company modules: ${error.message}`, 
        error.stack, 
        'CompanyController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error listing company modules';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Enable module for company - GLOBAL_ADMIN only' })
  @ApiParam({ name: 'companyId', type: String, example: '123', description: 'Company ID' })
  @ApiBody({
    description: 'Module to enable',
    schema: {
      example: {
        moduleId: "00000000000000000000000000000001"
      }
    }
  })
  @ApiOkResponse({
    description: 'Module enabled successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        moduleId: "00000000000000000000000000000001",
        moduleName: "Financial Module",
        moduleDescription: "Module for financial management",
        isActive: true,
        enabledAt: "2025-06-23T23:32:29.601Z",
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z"
      }
    }
  })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Post('companies/:companyId/modules')
  async enableModule(
    @Param('companyId') companyId: string,
    @Body() body: { moduleId: string }
  ) {
    this.logger.log(`Enabling module for company: ${companyId}`, 'CompanyController');
    this.logger.log(`Request body: ${JSON.stringify(body)}`, 'CompanyController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/companies/${companyId}/modules`, 'CompanyController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/companies/${companyId}/modules`, body)
      );
      
      this.logger.log(`Module enabled successfully: ${JSON.stringify(response.data)}`, 'CompanyController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error enabling module: ${error.message}`, 
        error.stack, 
        'CompanyController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error enabling module';
      throw new HttpException({ message }, status);
    }
  }
}
