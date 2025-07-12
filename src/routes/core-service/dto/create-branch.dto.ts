import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export class CreateBranchGatewayDto {
  @ApiProperty({
    description: 'CNPJ da filial (apenas números)',
    example: '12345678000199',
    minLength: 11
  })
  @IsString()
  @MinLength(3, { message: 'Tax ID must be at least 11 characters long' })
  @IsNotEmpty({ message: 'Tax ID is required' })
  @Transform(({ value }) => value?.replace(/[^\d]/g, ''))
  taxId: string;

  @ApiProperty({
    description: 'Nome da filial',
    example: 'Filial Centro',
    minLength: 3
  })
  @IsString()
  @MinLength(3, { message: 'Branch name must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Branch name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Código da filial',
    example: 'FIL001',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  code?: string;

  @ApiProperty({
    description: 'Email da filial',
    example: 'contato@filial.com.br',
    required: false
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({
    description: 'Telefone da filial',
    example: '+55 11 99999-9999',
    required: false,
    minLength: 10
  })
  @IsString()
  @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
  @Matches(/^[0-9+\-() ]+$/, { message: 'Phone number can only contain numbers, +, -, () and spaces' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiProperty({
    description: 'Responsável pela filial',
    example: 'João Silva',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  responsible?: string;

  @ApiProperty({
    description: 'Se é a sede da empresa',
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isHeadquarter?: boolean;

  @ApiProperty({
    description: 'Status da filial',
    enum: BranchStatus,
    example: BranchStatus.ACTIVE
  })
  @IsEnum(BranchStatus)
  status: BranchStatus;

  @ApiProperty({
    description: 'ID da empresa',
    example: '00000000-0000-0000-0000-000000000000'
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'ID do endereço',
    example: '00000000-0000-0000-0000-000000000000',
    required: false
  })
  @IsUUID()
  @IsOptional()
  addressId?: string;
} 