import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DepartmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  OBSOLETE = 'OBSOLETE'
}

export class CreateDepartmentGatewayDto {
  @ApiProperty({ description: 'Department name', minLength: 3, example: 'Finance' })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'the name is required' })
  @MinLength(3, { message: 'the name must be at least 3 characters long' })
  name: string;

  @ApiProperty({ description: 'Department description', required: false, example: 'Handles all financial operations' })
  @IsOptional()
  @IsString({ message: 'the description must be a string' })
  description?: string;

  @ApiProperty({ description: 'Department code', required: false, minLength: 3, example: 'FIN' })
  @IsOptional()
  @IsString({ message: 'the code must be a string' })
  @MinLength(3, { message: 'the code must be at least 3 characters long' })
  code?: string;

  @ApiProperty({ description: 'Responsible name', required: false, example: 'John Doe' })
  @IsOptional()
  @IsString({ message: 'the responsibleName must be a string' })
  responsibleName?: string;

  @ApiProperty({ description: 'Responsible email', required: false, example: 'john.doe@company.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  responsibleEmail?: string;

  @ApiProperty({ 
    description: 'Department status', 
    enum: DepartmentStatus, 
    example: DepartmentStatus.ACTIVE,
    required: true
  })
  @IsNotEmpty({ message: 'the status is required' })
  @IsEnum(DepartmentStatus, { message: 'Invalid department status' })
  status: DepartmentStatus;

  @ApiProperty({ description: 'Branch ID', example: '00000000-0000-0000-0000-000000000000' })
  @IsString({ message: 'the branchId must be a string' })
  @IsNotEmpty({ message: 'the branchId is required' })
  branchId: string;
} 