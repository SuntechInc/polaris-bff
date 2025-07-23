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
import { EnableCompanyModuleDto } from './dto/enable-company-module.dto';
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

  @ApiOperation({ 
    summary: 'Create a new company - GLOBAL_ADMIN only',
    description: `
Creates a new company with automatic data transformation and validation.

**Data Transformations:**
- Trading name and legal name: automatic trim
- Tax ID: removes non-numeric characters
- Email: converts to lowercase and trims
- Phone: automatic trim
- Tax country: converts to uppercase (default: BR)

**Validation Rules:**
- Trading name: minimum 3 characters
- Legal name: minimum 3 characters, required
- Tax ID: minimum 11 characters, removes non-digits
- Email: valid email format, required
- Phone: minimum 10 characters, optional
- Industry: must be valid enum value
- Segment: must be valid enum value
- Status: defaults to ACTIVE
- isBaseCompany: defaults to false
    `
  })
  @ApiBody({
    type: CreateCompanyGatewayDto,
    examples: {
      example1: {
        summary: 'Basic company creation',
        value: {
          tradingName: 'Empresa XPTO',
          legalName: 'Empresa XPTO LTDA',
          taxId: '12345678000199',
          email: 'contato@empresa.com',
          phone: '+55 11 99999-9999',
          industry: 'HEALTHCORE',
          segment: 'LABORATORY',
          status: 'ACTIVE',
          isBaseCompany: false
        },
      },
      example2: {
        summary: 'Company with minimal data',
        value: {
          tradingName: 'Minimal Company',
          legalName: 'Minimal Company LTDA',
          taxId: '12345678901',
          email: 'minimal@company.com',
          industry: 'TECHNOLOGY',
          segment: 'HOSPITAL'
        },
      },
      example3: {
        summary: 'Company with tax ID formatting',
        value: {
          tradingName: 'Formatted Company',
          legalName: 'Formatted Company LTDA',
          taxId: '12.345.678/0001-99', // Will be transformed to: 12345678000199
          email: 'formatted@company.com',
          phone: '(11) 99999-9999',
          industry: 'AGRIBUSINESS',
          segment: 'ANIMAL_HEALTH',
          taxCountry: 'br' // Will be transformed to: BR
        },
      },
    },
  })
  @Post('company')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() dto: CreateCompanyGatewayDto) {
    this.logger.log(`Tentando criar empresa: ${JSON.stringify(dto)}`, 'CompanyController');
    this.logger.log(`DTO type: ${typeof dto}`, 'CompanyController');
    this.logger.log(`DTO keys: ${Object.keys(dto || {})}`, 'CompanyController');
    
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

  @ApiOperation({ 
    summary: 'Update company - GLOBAL_ADMIN only',
    description: `
Updates an existing company with automatic data transformation and validation.

**Data Transformations:**
- Trading name and legal name: automatic trim
- Tax ID: removes non-numeric characters
- Email: converts to lowercase and trims
- Phone: automatic trim
- Tax country: converts to uppercase

**Validation Rules:**
- Trading name: minimum 3 characters
- Legal name: minimum 3 characters, required
- Tax ID: minimum 11 characters, removes non-digits
- Email: valid email format, required
- Phone: minimum 10 characters, optional
- Industry: must be valid enum value
- Segment: must be valid enum value
- Status: must be valid enum value
    `
  })
  @ApiParam({ name: 'id', type: String, example: 'cmc1234567890abcdef', description: 'Company ID' })
  @ApiBody({
    type: CreateCompanyGatewayDto,
    examples: {
      example1: {
        summary: 'Update company information',
        value: {
          tradingName: 'Updated Company Name',
          legalName: 'Updated Company Name LTDA',
          taxId: '12345678000199',
          email: 'updated@company.com',
          phone: '+55 11 98888-8888',
          industry: 'HEALTHCORE',
          segment: 'LABORATORY',
          status: 'ACTIVE',
          isBaseCompany: false
        },
      },
      example2: {
        summary: 'Partial update with formatting',
        value: {
          tradingName: '  New Company Name  ', // Will be trimmed
          legalName: 'New Company Name LTDA',
          taxId: '12.345.678/0001-99', // Will be transformed to: 12345678000199
          email: '  NEW@COMPANY.COM  ', // Will be transformed to: new@company.com
          phone: '  (11) 99999-9999  ', // Will be trimmed
          industry: 'TECHNOLOGY',
          segment: 'HOSPITAL',
          taxCountry: 'br' // Will be transformed to: BR
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

  @ApiOperation({ 
    summary: 'List available modules - GLOBAL_ADMIN only',
    description: `
Retrieves all available modules that can be enabled for companies.

This endpoint returns the list of modules that are available in the system
and can be assigned to companies. Each module contains basic information
like name, description, and status.
    `
  })
  @ApiOkResponse({
    description: 'List of available modules',
    schema: {
      example: [
        {
          id: "00000000000000000000000000000000",
          name: "Financial Module",
          description: "Module for financial management and accounting",
          isActive: true,
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        },
        {
          id: "00000000000000000000000000000001",
          name: "HR Module",
          description: "Module for human resources management",
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

  @ApiOperation({ 
    summary: 'List company modules - GLOBAL_ADMIN only',
    description: `
Retrieves all modules that are currently enabled for a specific company.

This endpoint returns the list of modules that have been enabled for the
specified company, including module details and activation information.
    `
  })
  @ApiParam({ name: 'companyId', type: String, example: 'cmc1234567890abcdef', description: 'Company ID' })
  @ApiOkResponse({
    description: 'List of company modules',
    schema: {
      example: [
        {
          id: "00000000000000000000000000000000",
          moduleId: "00000000000000000000000000000001",
          moduleName: "Financial Module",
          moduleDescription: "Module for financial management and accounting",
          isActive: true,
          enabledAt: "2025-06-23T23:32:29.601Z",
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        },
        {
          id: "00000000000000000000000000000002",
          moduleId: "00000000000000000000000000000003",
          moduleName: "HR Module",
          moduleDescription: "Module for human resources management",
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

  @ApiOperation({ 
    summary: 'Enable module for company - GLOBAL_ADMIN only',
    description: `
Enables a specific module for a company.

This endpoint activates a module for the specified company, allowing the
company to use the module's features. The module must be available in
the system before it can be enabled.

**Required Fields:**
- moduleCode: The code of the module to enable (e.g., 'FINANCIAL', 'HR')
- segment: The segment for the module (e.g., 'LABORATORY', 'HOSPITAL')

**Data Transformations:**
- moduleCode: automatic trim
    `
  })
  @ApiParam({ name: 'companyId', type: String, example: 'cmc1234567890abcdef', description: 'Company ID' })
  @ApiBody({
    type: EnableCompanyModuleDto,
    description: 'Module to enable',
    examples: {
      example1: {
        summary: 'Enable Financial Module for Laboratory',
        value: {
          moduleCode: 'FINANCIAL',
          segment: 'LABORATORY'
        }
      },
      example2: {
        summary: 'Enable HR Module for Hospital',
        value: {
          moduleCode: 'HR',
          segment: 'HOSPITAL'
        }
      },
      example3: {
        summary: 'Enable Financial Module with formatting',
        value: {
          moduleCode: '  FINANCIAL  ', // Will be trimmed to: FINANCIAL
          segment: 'LABORATORY'
        }
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
        moduleDescription: "Module for financial management and accounting",
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
    @Body() dto: EnableCompanyModuleDto
  ) {
    this.logger.log(`Enabling module for company: ${companyId}`, 'CompanyController');
    this.logger.log(`Request body: ${JSON.stringify(dto)}`, 'CompanyController');
    this.logger.log(`DTO type: ${typeof dto}`, 'CompanyController');
    this.logger.log(`DTO keys: ${Object.keys(dto || {})}`, 'CompanyController');
    
    try {
      this.logger.log(`Sending request to: ${this.coreServiceUrl}/companies/${companyId}/modules`, 'CompanyController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/companies/${companyId}/modules`, dto)
      );
      
      this.logger.log(`Module enabled successfully: ${JSON.stringify(response.data)}`, 'CompanyController');
      
      // O core-service retorna um objeto com response, então precisamos extrair os dados
      if (response.data && response.data.response) {
        return response.data.response;
      }
      
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error enabling module: ${error.message}`, 
        error.stack, 
        'CompanyController'
      );
      
      if (error.response) {
        this.logger.error(
          `Core service response status: ${error.response.status}`, 
          undefined, 
          'CompanyController'
        );
        this.logger.error(
          `Core service response data: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyController'
        );
        this.logger.error(
          `Core service response headers: ${JSON.stringify(error.response.headers)}`, 
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
