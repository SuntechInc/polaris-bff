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
import { CreateCompanyGatewayDto } from '@/dto/create-company.dto';
import { EnableCompanyModuleDto } from '@/dto/enable-company-module.dto';
import { CompanyResponseDto } from '@/dto/company-response.dto';
import { ApiBody, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AdminGuard } from '@/guards/admin.guard';

@ApiTags('Company')
@Controller()
export class CompanyAdminController {
  private readonly coreServiceUrl: string;
  private readonly logger = new Logger(CompanyAdminController.name);

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
    this.logger.log(`Core Service URL configurada: ${this.coreServiceUrl}`, 'CompanyAdminController');
  }

  @ApiOperation({ 
    summary: 'Filter companies with dynamic filters',
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
        summary: 'Filter by status and segment',
        value: '{"status":"ACTIVE","segment":"HOSPITAL"}'
      },
      example2: {
        summary: 'Filter by industry',
        value: '{"industry":"TECHNOLOGY"}'
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
    summary: 'Create a new company',
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
  @ApiCreatedResponse({
    description: 'Company created successfully',
    type: CompanyResponseDto,
    schema: {
      example: {
        id: "cmdqsfyci0000i063yo119vge",
        tradingName: "Empresa Teste LTDA",
        legalName: "Empresa Teste Comércio e Serviços LTDA",
        taxId: "12345678000199",
        taxCountry: "BR",
        email: "contato@empresateste.com.br",
        phone: "(11) 99999-9999",
        industry: "TECHNOLOGY",
        segment: "HOSPITAL",
        status: "ACTIVE",
        createdAt: "2025-07-31T02:41:14.658Z",
        updatedAt: "2025-07-31T02:41:14.658Z"
      }
    }
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
    this.logger.log(`Tentando criar empresa: ${JSON.stringify(dto)}`, 'CompanyAdminController');
    
    try {
      this.logger.log(`Enviando requisição para: ${this.coreServiceUrl}/companies`, 'CompanyAdminController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/companies`, dto),
      );
      
      this.logger.log(`Empresa criada com sucesso: ${JSON.stringify(response.data)}`, 'CompanyAdminController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao criar empresa: ${error.message}`, 
        error.stack, 
        'CompanyAdminController'
      );
      
      if (error.response) {
        this.logger.error(
          `Resposta do core service: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyAdminController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Erro ao criar empresa';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Update company',
    description: `
Updates an existing company with automatic data transformation and validation.

**Data Transformations:**
- Trading name and legal name: automatic trim
- Tax ID: removes non-numeric characters
- Email: converts to lowercase and trims
- Phone: automatic trim
- Tax country: converts to uppercase
    `
  })
  @ApiParam({ name: 'id', type: String, example: '123', description: 'Company ID' })
  @ApiBody({
    type: CreateCompanyGatewayDto,
    examples: {
      example1: {
        summary: 'Update company data',
        value: {
          tradingName: 'Empresa XPTO Atualizada',
          legalName: 'Empresa XPTO Atualizada LTDA',
          taxId: '12345678000199',
          email: 'novo@empresa.com',
          phone: '+55 11 98888-8888',
          industry: 'TECHNOLOGY',
          segment: 'HOSPITAL',
          status: 'ACTIVE',
          isBaseCompany: false
        },
      },
    },
  })
  @Put('companies/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateCompany(
    @Param('id') id: string,
    @Body() dto: CreateCompanyGatewayDto
  ) {
    this.logger.log(`Tentando atualizar empresa ${id}: ${JSON.stringify(dto)}`, 'CompanyAdminController');
    
    try {
      this.logger.log(`Enviando requisição para: ${this.coreServiceUrl}/companies/${id}`, 'CompanyAdminController');

      const response = await firstValueFrom(
        this.httpService.put(`${this.coreServiceUrl}/companies/${id}`, dto),
      );
      
      this.logger.log(`Empresa atualizada com sucesso: ${JSON.stringify(response.data)}`, 'CompanyAdminController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao atualizar empresa: ${error.message}`, 
        error.stack, 
        'CompanyAdminController'
      );
      
      if (error.response) {
        this.logger.error(
          `Resposta do core service: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyAdminController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Erro ao atualizar empresa';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'List available modules',
    description: `
Lists all available modules that can be enabled for companies.
    `
  })
  @ApiOkResponse({
    description: 'List of available modules',
    schema: {
      example: [
        {
          id: "00000000000000000000000000000000",
          code: "HR",
          name: "Human Resources",
          description: "Human resources management module",
          isActive: true,
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z"
        }
      ]
    }
  })
  @Get('companies/modules')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async listModules() {
    this.logger.log('Listando módulos disponíveis...', 'CompanyAdminController');
    
    try {
      this.logger.log(`Enviando requisição para: ${this.coreServiceUrl}/companies/modules`, 'CompanyAdminController');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/companies/modules`),
      );
      
      this.logger.log(`Módulos listados com sucesso: ${JSON.stringify(response.data)}`, 'CompanyAdminController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao listar módulos: ${error.message}`, 
        error.stack, 
        'CompanyAdminController'
      );
      
      if (error.response) {
        this.logger.error(
          `Resposta do core service: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyAdminController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Erro ao listar módulos';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'List company modules',
    description: `
Lists all modules enabled for a specific company.
    `
  })
  @ApiParam({ name: 'companyId', type: String, example: '123', description: 'Company ID' })
  @ApiOkResponse({
    description: 'List of company modules',
    schema: {
      example: [
        {
          id: "00000000000000000000000000000000",
          companyId: "00000000000000000000000000000000",
          moduleId: "00000000000000000000000000000000",
          isActive: true,
          createdAt: "2025-06-23T23:32:29.601Z",
          updatedAt: "2025-06-23T23:32:29.601Z",
          module: {
            id: "00000000000000000000000000000000",
            code: "HR",
            name: "Human Resources",
            description: "Human resources management module",
            isActive: true
          }
        }
      ]
    }
  })
  @Get('companies/:companyId/modules')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async listCompanyModules(@Param('companyId') companyId: string) {
    this.logger.log(`Listando módulos da empresa: ${companyId}`, 'CompanyAdminController');
    
    try {
      this.logger.log(`Enviando requisição para: ${this.coreServiceUrl}/companies/${companyId}/modules`, 'CompanyAdminController');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/companies/${companyId}/modules`),
      );
      
      this.logger.log(`Módulos da empresa listados com sucesso: ${JSON.stringify(response.data)}`, 'CompanyAdminController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao listar módulos da empresa: ${error.message}`, 
        error.stack, 
        'CompanyAdminController'
      );
      
      if (error.response) {
        this.logger.error(
          `Resposta do core service: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyAdminController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Erro ao listar módulos da empresa';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ 
    summary: 'Enable module for company',
    description: `
Enables a specific module for a company.

**Required fields:**
- moduleCode: The module code to enable
- segment: The segment for the module
    `
  })
  @ApiParam({ name: 'companyId', type: String, example: '123', description: 'Company ID' })
  @ApiBody({
    type: EnableCompanyModuleDto,
    examples: {
      example1: {
        summary: 'Enable HR module',
        value: {
          moduleCode: 'HR',
          segment: 'HOSPITAL'
        },
      },
      example2: {
        summary: 'Enable Finance module',
        value: {
          moduleCode: 'FINANCE',
          segment: 'LABORATORY'
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Module enabled successfully',
    schema: {
      example: {
        id: "00000000000000000000000000000000",
        companyId: "00000000000000000000000000000000",
        moduleId: "00000000000000000000000000000000",
        isActive: true,
        createdAt: "2025-06-23T23:32:29.601Z",
        updatedAt: "2025-06-23T23:32:29.601Z",
        module: {
          id: "00000000000000000000000000000000",
          code: "HR",
          name: "Human Resources",
          description: "Human resources management module",
          isActive: true
        }
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
    this.logger.log(`Recebido body: ${JSON.stringify(dto)}`, 'CompanyAdminController');
    this.logger.log(`Company ID: ${companyId}`, 'CompanyAdminController');
    
    try {
      this.logger.log(`Enviando requisição para: ${this.coreServiceUrl}/companies/${companyId}/modules`, 'CompanyAdminController');
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.coreServiceUrl}/companies/${companyId}/modules`, dto),
      );
      
      this.logger.log(`Módulo ativado com sucesso: ${JSON.stringify(response.data)}`, 'CompanyAdminController');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao ativar módulo: ${error.message}`, 
        error.stack, 
        'CompanyAdminController'
      );
      
      if (error.response) {
        this.logger.error(
          `Resposta do core service: ${JSON.stringify(error.response.data)}`, 
          undefined, 
          'CompanyAdminController'
        );
      }
      
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Erro ao ativar módulo';
      throw new HttpException({ message }, status);
    }
  }
} 