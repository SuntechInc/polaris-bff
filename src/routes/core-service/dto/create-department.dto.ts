import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DepartmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export class CreateDepartmentGatewayDto {
  @ApiProperty({ description: 'Department name', minLength: 3, example: 'Finance' })
  @IsString()
  @IsNotEmpty({ message: 'the name is required' })
  @MinLength(3, { message: 'the name must be at least 3 characters long' })
  name: string;

  @ApiProperty({ description: 'Department description', required: false, example: 'Handles all financial operations' })
  @IsString({ message: 'the description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Department code', required: false, minLength: 3, example: 'FIN' })
  @IsString({ message: 'the description must be a string' })
  @IsOptional()
  @MinLength(3, { message: 'the code must be at least 3 characters long' })
  code?: string;

  @ApiProperty({ description: 'Responsible name', required: false, example: 'John Doe' })
  @IsString({ message: 'the code must be a string' })
  @IsOptional()
  responsibleName?: string;

  @ApiProperty({ description: 'Responsible email', required: false, example: 'john.doe@company.com' })
  @IsString({ message: 'the responsibleEmail must be a string' })
  @IsOptional()
  responsibleEmail?: string;

  @ApiProperty({ description: 'Department status', enum: DepartmentStatus, example: 'ACTIVE' })
  @IsEnum(String)
  status: string;

  @ApiProperty({ description: 'Branch ID', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  @IsNotEmpty({ message: 'the branchId is required' })
  branchId: string;
} 