import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobTitleVersionGatewayDto {
  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Job Title ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Job Title ID is required' })
  jobTitleId: string;

  @ApiProperty({ 
    example: 1, 
    description: 'Version number',
    required: true
  })
  @IsNumber()
  @Min(1, { message: 'Version must be at least 1' })
  version: number;

  @ApiProperty({ 
    example: 'Updated job description for version 2', 
    description: 'Version description',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ 
    example: ['Code review', 'Mentor junior developers', 'Lead technical discussions'], 
    description: 'List of responsibilities',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Responsibilities must be an array' })
  @IsString({ each: true, message: 'Each responsibility must be a string' })
  responsibilities?: string[];

  @ApiProperty({ 
    example: ['5+ years experience', 'React knowledge', 'Team leadership skills'], 
    description: 'List of requirements',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Requirements must be an array' })
  @IsString({ each: true, message: 'Each requirement must be a string' })
  requirements?: string[];
} 