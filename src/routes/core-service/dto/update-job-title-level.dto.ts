import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateJobTitleLevelGatewayDto {
  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Job Title Version ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Job Title Version ID must be a string' })
  jobTitleVersionId?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Company ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Company ID must be a string' })
  companyId?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Branch ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Branch ID must be a string' })
  branchId?: string;

  @ApiProperty({ 
    example: 'Lead', 
    description: 'Level label (e.g., Junior, Senior, Lead)',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Level label must be a string' })
  @Transform(({ value }) => value?.trim())
  label?: string;

  @ApiProperty({ 
    example: 4, 
    description: 'Level rank (1 = lowest, higher numbers = higher level)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Rank must be at least 1' })
  @Max(10, { message: 'Rank cannot exceed 10' })
  rank?: number;

  @ApiProperty({ 
    example: 6000, 
    description: 'Minimum salary for this level',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Minimum salary cannot be negative' })
  salaryMin?: number;

  @ApiProperty({ 
    example: 10000, 
    description: 'Maximum salary for this level',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Maximum salary cannot be negative' })
  salaryMax?: number;
} 