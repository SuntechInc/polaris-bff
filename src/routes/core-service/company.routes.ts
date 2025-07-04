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

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL');
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
      const message = error.response?.data?.message || 'Erro ao buscar empresa';
      throw new HttpException({ message }, status);
    }
  }

  @ApiOperation({ summary: 'Create a new company - Apenas GLOBAL_ADMIN' })
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
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() dto: CreateCompanyGatewayDto) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.coreServiceUrl}/companies`, dto),
    );
    return response.data;
  }
}
