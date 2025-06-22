import { ApiProperty } from '@nestjs/swagger';
import { Industry, Segment } from './enums'; 

export class CreateCompanyGatewayDto {
  @ApiProperty({ example: 'Empresa XPTO', description: 'Nome fantasia da empresa' })
  tradingName: string;

  @ApiProperty({ example: 'Empresa XPTO LTDA', description: 'Razão social da empresa' })
  legalName: string;

  @ApiProperty({ example: '12345678000199', description: 'CNPJ da empresa' })
  taxId: string;

  @ApiProperty({ example: 'contato@empresa.com', description: 'E-mail da empresa' })
  email: string;

  @ApiProperty({ example: '+55 11 99999-9999', description: 'Telefone da empresa', required: false })
  phone?: string;

  @ApiProperty({
    enum: Industry,
    example: Industry.HEALTHCORE,
    description: 'Setor da empresa',
  })
  industry: Industry;

  @ApiProperty({
    enum: Segment,
    example: Segment.LABORATORY,
    description: 'Segmento da empresa dentro do setor',
  })
  segment: Segment;

  @ApiProperty({ example: true, description: 'Se a empresa está ativa ou não', default: true })
  isActive?: boolean;
}
