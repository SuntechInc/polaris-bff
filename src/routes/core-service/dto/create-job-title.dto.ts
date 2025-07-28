import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobTitleGatewayDto {
  @ApiProperty({ 
    example: 'Senior Developer', 
    description: 'Job title name',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Job title name is required' })
  @MinLength(2, { message: 'Job title name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ 
    example: 'Senior software developer position', 
    description: 'Job title description',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  // Company ID is automatically handled by the system

  @ApiProperty({ 
    example: 'DEV-SR', 
    description: 'Job title code',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @Transform(({ value }) => value?.trim())
  code?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Branch ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: string;
} 