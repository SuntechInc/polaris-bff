import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreateCompanyGatewayDto } from './dto/create-company.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Company')
@Controller() // 🔥 Adiciona um prefixo para manter consistência na API
export class CompanyController {
  constructor(private httpService: HttpService) {}

  @ApiOperation({ summary: 'Get all companies' })
  @HttpCode(HttpStatus.OK)
  @Get('companies')
  async getCompanies() {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3333/api/companies'),
    );
    return response.data;
  }

  @ApiOperation({ summary: 'Create a new company' })
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
      this.httpService.post('http://localhost:3333/api/companies', dto),
    );
    return response.data;
  }
}
