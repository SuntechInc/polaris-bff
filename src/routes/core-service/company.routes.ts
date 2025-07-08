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
  // Res, // Removido
  HttpException,
  Put,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateCompanyGatewayDto } from './dto/create-company.dto';
import { ApiBody, ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { AdminGuard } from '../../guards/admin.guard';
// import { Response } from 'express'; // Removido

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

  @ApiOperation({ summary: 'Get all companies - Apenas GLOBAL_ADMIN' })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Get('companies')
  async getCompanies(
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (take !== undefined) params.take = take;
    if (skip !== undefined) params.skip = skip;

    const response = await firstValueFrom(
      this.httpService.get(`${this.coreServiceUrl}/companies`, { params }),
    );
    return response.data;
  }

  @ApiOperation({ summary: 'Buscar empresa por TaxId - Apenas GLOBAL_ADMIN' })
  @ApiParam({ name: 'taxId', type: String, example: '0000000000000', description: 'CNPJ ou identificador da empresa' })
  @UseGuards(AdminGuard)
  @Get('companies/search/:taxId')
  async findByTaxId(@Param('taxId') taxId: string) {
   
    const cleanTaxId = taxId.replace(/\D/g, '');
    try {
      const coreResponse = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/companies/search/${cleanTaxId}`)
      );
      return coreResponse.data;
    } catch (error: any) {
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error searching company';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Buscar empresa por nome - Apenas GLOBAL_ADMIN' })
  @ApiParam({ name: 'name', type: String, example: 'quali', description: 'Nome (ou parte do nome) da empresa' })
  @UseGuards(AdminGuard)
  @Get('companies/search/name/:name')
  async findByName(@Param('name') name: string) {
    try {
      const coreResponse = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/companies/search/name/${encodeURIComponent(name)}`)
      );
      return coreResponse.data;
    } catch (error: any) {
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data?.message || 'Error searching company by name';
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
}
