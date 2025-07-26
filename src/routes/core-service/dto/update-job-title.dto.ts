import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateJobTitleGatewayDto {
  @ApiProperty({ 
    example: 'Senior Software Engineer', 
    description: 'Job title name',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Job title name must be a string' })
  @MinLength(2, { message: 'Job title name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ 
    example: 'Updated description for senior software engineer', 
    description: 'Job title description',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Company ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Company ID must be a string' })
  companyId?: string;

  @ApiProperty({ 
    example: 'SSE', 
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
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Branch ID must be a string' })
  branchId?: string;
} 