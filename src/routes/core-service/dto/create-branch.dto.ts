import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export class CreateBranchGatewayDto {
  @ApiProperty({
    description: 'Branch tax ID (numbers only)',
    example: '12345678000199',
    minLength: 11
  })
  @IsString()
  @MinLength(3, { message: 'Tax ID must be at least 11 characters long' })
  @IsNotEmpty({ message: 'Tax ID is required' })
  @Transform(({ value }) => value?.replace(/[^\d]/g, ''))
  taxId: string;

  @ApiProperty({
    description: 'Trading name of the branch',
    example: 'Branch XPTO',
    minLength: 3
  })
  @IsString()
  @MinLength(3, { message: 'Trading name must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Trading name is required' })
  @Transform(({ value }) => value?.trim())
  tradingName: string;

  @ApiProperty({
    description: 'Legal name of the branch',
    example: 'Branch XPTO LTDA',
    minLength: 3
  })
  @IsString()
  @MinLength(3, { message: 'Legal name must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Legal name is required' })
  @Transform(({ value }) => value?.trim())
  legalName: string;

  @ApiProperty({
    description: 'Branch code',
    example: 'BR001',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  code?: string;

  @ApiProperty({
    description: 'Branch email',
    example: 'contact@branch.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({
    description: 'Branch phone number',
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
    description: 'Branch responsible',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  responsible?: string;

  @ApiProperty({
    description: 'Is headquarter',
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isHeadquarter?: boolean;

  @ApiProperty({
    description: 'Branch status',
    enum: BranchStatus,
    example: BranchStatus.ACTIVE
  })
  @IsEnum(BranchStatus)
  status: BranchStatus;

  // Company ID is automatically handled by the system

  @ApiProperty({
    description: 'Address ID',
    example: '248bdgawr',
    required: false
  })
  @IsString({ message: 'Address ID must be a string' })
  @IsOptional()
  addressId?: string;
} 