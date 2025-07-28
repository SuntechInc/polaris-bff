import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTOR = 'CONTRACTOR',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN'
}

export enum EmployeeStatus {
  IN_PROCESS = 'IN_PROCESS',
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  OBSOLETE = 'OBSOLETE'
}

export class CreateEmployeeGatewayDto {
  @ApiProperty({ 
    example: 'João Silva', 
    description: 'Employee full name',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Employee name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ 
    example: 'joao.silva@company.com', 
    description: 'Employee email (must be unique)',
    required: true
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Employee email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    example: '+55 11 99999-9999', 
    description: 'Employee phone number',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Employee phone is required' })
  @Transform(({ value }) => value?.trim())
  phone: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Department ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Current Job Title Version ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Current Job Title Version ID is required' })
  currentJobTitleVersionId: string;

  @ApiProperty({ 
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
    description: 'Employment type',
    required: true
  })
  @IsEnum(EmploymentType, { message: 'Invalid employment type' })
  employmentType: EmploymentType = EmploymentType.FULL_TIME;

  @ApiProperty({ 
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    description: 'Employee status',
    required: true
  })
  @IsEnum(EmployeeStatus, { message: 'Invalid employee status' })
  status: EmployeeStatus = EmployeeStatus.ACTIVE;

  @ApiProperty({ 
    example: '2024-01-15T00:00:00.000Z', 
    description: 'Hire date',
    required: true
  })
  @IsDateString({}, { message: 'Invalid hire date format' })
  @IsNotEmpty({ message: 'Hire date is required' })
  hiredAt: string;

  @ApiProperty({ 
    example: '2024-12-31T00:00:00.000Z', 
    description: 'Leave date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid leave date format' })
  leftAt?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Branch ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: string;
} 