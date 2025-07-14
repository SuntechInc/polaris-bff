import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNotEmpty, Length, Matches } from 'class-validator';
import { Industry, Segment } from './enums'; 

export class CreateCompanyGatewayDto {
  @ApiProperty({ example: 'Empresa XPTO', description: 'Trading name of the company' })
  @IsString({ message: 'Trading name must be a string' })
  @IsNotEmpty({ message: 'Trading name is required' })
  @Length(2, 100, { message: 'Trading name must be between 2 and 100 characters' })
  tradingName: string;

  @ApiProperty({ example: 'Empresa XPTO LTDA', description: 'Legal name of the company' })
  @IsString({ message: 'Legal name must be a string' })
  @IsNotEmpty({ message: 'Legal name is required' })
  @Length(2, 200, { message: 'Legal name must be between 2 and 200 characters' })
  legalName: string;

  @ApiProperty({ example: '12345678000199', description: 'Company tax ID' })
  @IsString({ message: 'Tax ID must be a string' })
  @IsNotEmpty({ message: 'Tax ID is required' })
  @Matches(/^\d{14}$/, { message: 'Tax ID must contain exactly 14 numeric digits' })
  taxId: string;

  @ApiProperty({ example: 'contato@empresa.com', description: 'Company email' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '+55 11 99999-9999', description: 'Company phone', required: false })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[\d\s\-\(\)]+$/, { message: 'Phone must contain only numbers, spaces, hyphens and parentheses' })
  phone?: string;

  @ApiProperty({
    enum: Industry,
    example: Industry.HEALTHCORE,
    description: 'Industry of the company',
  })
  @IsEnum(Industry, { message: 'Industry must be a valid value' })
  @IsNotEmpty({ message: 'Industry is required' })
  industry: Industry;

  @ApiProperty({
    enum: Segment,
    example: Segment.LABORATORY,
    description: 'Segment of the company within the industry',
  })
  @IsEnum(Segment, { message: 'Segment must be a valid value' })
  @IsNotEmpty({ message: 'Segment is required' })
  segment: Segment;

  @ApiProperty({ example: 'BR', description: 'Country code for taxId', required: false })
  @IsOptional()
  @IsString({ message: 'Tax country must be a string' })
  @Length(2, 2, { message: 'Tax country must be exactly 2 characters' })
  taxCountry?: string;

  @ApiProperty({ 
    example: 'ACTIVE', 
    description: 'Company status', 
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], { message: 'Status must be a valid value' })
  status?: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'Address ID', 
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Address ID must be a string' })
  addressId?: string;

  @ApiProperty({ 
    example: false, 
    description: 'if company is base company', 
    required: false 
  })
  @IsOptional()
  @IsBoolean({ message: 'isBaseCompany must be a boolean value' })
  isBaseCompany?: boolean;
}
