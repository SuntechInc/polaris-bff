import { ApiProperty } from '@nestjs/swagger';
import { Industry, Segment, CompanyStatus } from './enums';

export class CompanyResponseDto {
  @ApiProperty({ 
    example: 'cmdqsfyci0000i063yo119vge', 
    description: 'Unique identifier for the company' 
  })
  id: string;

  @ApiProperty({ 
    example: 'Empresa Teste LTDA', 
    description: 'Trading name of the company' 
  })
  tradingName: string;

  @ApiProperty({ 
    example: 'Empresa Teste Comércio e Serviços LTDA', 
    description: 'Legal name of the company' 
  })
  legalName: string;

  @ApiProperty({ 
    example: '12345678000199', 
    description: 'Company tax ID' 
  })
  taxId: string;

  @ApiProperty({ 
    example: 'BR', 
    description: 'Country code for taxId' 
  })
  taxCountry: string;

  @ApiProperty({ 
    example: 'contato@empresateste.com.br', 
    description: 'Company email' 
  })
  email: string;

  @ApiProperty({ 
    example: '(11) 99999-9999', 
    description: 'Company phone number',
    required: false
  })
  phone?: string;

  @ApiProperty({
    enum: Industry,
    example: Industry.TECHNOLOGY,
    description: 'Industry of the company',
  })
  industry: Industry;

  @ApiProperty({
    enum: Segment,
    example: Segment.HOSPITAL,
    description: 'Segment of the company within the industry',
  })
  segment: Segment;

  @ApiProperty({ 
    enum: CompanyStatus,
    example: CompanyStatus.ACTIVE, 
    description: 'Company status' 
  })
  status: CompanyStatus;

  @ApiProperty({ 
    example: '2025-07-31T02:41:14.658Z', 
    description: 'Timestamp when the company was created' 
  })
  createdAt: string;

  @ApiProperty({ 
    example: '2025-07-31T02:41:14.658Z', 
    description: 'Timestamp when the company was last updated' 
  })
  updatedAt: string;
} 