import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateJobTitleVersionGatewayDto {
  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Job Title ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Job Title ID must be a string' })
  jobTitleId?: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Version number',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Version must be at least 1' })
  version?: number;

  @ApiProperty({ 
    example: 'Updated job description for version 3', 
    description: 'Version description',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ 
    example: ['Code review', 'Mentor junior developers', 'Lead technical discussions', 'Architecture design'], 
    description: 'List of responsibilities',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Responsibilities must be an array' })
  @IsString({ each: true, message: 'Each responsibility must be a string' })
  responsibilities?: string[];

  @ApiProperty({ 
    example: ['7+ years experience', 'React knowledge', 'Team leadership skills', 'System design experience'], 
    description: 'List of requirements',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Requirements must be an array' })
  @IsString({ each: true, message: 'Each requirement must be a string' })
  requirements?: string[];
} 