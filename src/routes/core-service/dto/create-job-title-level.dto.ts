import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobTitleLevelGatewayDto {
  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Job Title Version ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Job Title Version ID is required' })
  jobTitleVersionId: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Company ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Branch ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: string;

  @ApiProperty({ 
    example: 'Senior', 
    description: 'Level label (e.g., Junior, Senior, Lead)',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Level label is required' })
  @Transform(({ value }) => value?.trim())
  label: string;

  @ApiProperty({ 
    example: 3, 
    description: 'Level rank (1 = lowest, higher numbers = higher level)',
    required: true
  })
  @IsNumber()
  @Min(1, { message: 'Rank must be at least 1' })
  @Max(10, { message: 'Rank cannot exceed 10' })
  rank: number;

  @ApiProperty({ 
    example: 5000, 
    description: 'Minimum salary for this level',
    required: true
  })
  @IsNumber()
  @Min(0, { message: 'Minimum salary cannot be negative' })
  salaryMin: number;

  @ApiProperty({ 
    example: 8000, 
    description: 'Maximum salary for this level',
    required: true
  })
  @IsNumber()
  @Min(0, { message: 'Maximum salary cannot be negative' })
  salaryMax: number;
} 