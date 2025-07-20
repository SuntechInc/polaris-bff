import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { Industry, Segment, CompanyStatus } from './enums'; 

export class CreateCompanyGatewayDto {
  @ApiProperty({ example: 'Empresa XPTO', description: 'Trading name of the company' })
  @IsString()
  @MinLength(3, { message: 'Trading name must be at least 3 characters long' })
  @Transform(({ value }) => value?.trim())
  tradingName: string;

  @ApiProperty({ example: 'Empresa XPTO LTDA', description: 'Legal name of the company' })
  @IsString()
  @MinLength(3, { message: 'Legal name must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Legal name is required' })
  @Transform(({ value }) => value?.trim())
  legalName: string;

  @ApiProperty({ example: '12345678000199', description: 'Company tax ID' })
  @IsString()
  @MinLength(11, { message: 'Tax ID must be at least 11 characters long' })
  @IsNotEmpty({ message: 'Tax ID is required' })
  @Transform(({ value }) => value?.replace(/[^\d]/g, '')) // Remove caracteres não numéricos
  taxId: string;

  @ApiProperty({ example: 'BR', description: 'Country code for taxId', required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  taxCountry?: string = 'BR';

  @ApiProperty({ example: 'contato@empresa.com', description: 'Company email' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '+55 11 99999-9999', description: 'Company phone', required: false })
  @IsString()
  @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
  @Matches(/^[0-9+\-() ]+$/, { message: 'Phone number can only contain numbers, +, -, () and spaces' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiProperty({
    enum: Industry,
    example: Industry.HEALTHCORE,
    description: 'Industry of the company',
  })
  @IsEnum(Industry, { message: 'Invalid industry' })
  industry: Industry;

  @ApiProperty({
    enum: Segment,
    example: Segment.LABORATORY,
    description: 'Segment of the company within the industry',
  })
  @IsEnum(Segment, { message: 'Invalid segment' })
  segment: Segment;

  @ApiProperty({ 
    example: CompanyStatus.ACTIVE, 
    description: 'Company status', 
    enum: CompanyStatus,
    required: false 
  })
  @IsEnum(CompanyStatus, { message: 'Invalid company status' })
  status: CompanyStatus = CompanyStatus.ACTIVE;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'Address ID', 
    required: false 
  })
  @IsString({ message: 'Address ID must be a string' })
  @IsOptional()
  addressId?: string;

  @ApiProperty({ 
    example: false, 
    description: 'if company is base company', 
    required: false 
  })
  @IsOptional()
  isBaseCompany?: boolean = false;
}
