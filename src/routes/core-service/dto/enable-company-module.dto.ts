import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Segment } from './enums';

export class EnableCompanyModuleDto {
  @ApiProperty({ 
    example: 'FINANCIAL', 
    description: 'Module code to enable',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Module code is required' })
  @Transform(({ value }) => value?.trim())
  moduleCode: string;

  @ApiProperty({
    enum: Segment,
    example: Segment.LABORATORY,
    description: 'Segment for the module',
    required: true
  })
  @IsEnum(Segment, { message: 'Invalid segment' })
  segment: Segment;
} 