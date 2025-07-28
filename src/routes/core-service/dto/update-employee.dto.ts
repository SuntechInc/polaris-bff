import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmploymentType, EmployeeStatus } from './create-employee.dto';

export class UpdateEmployeeGatewayDto {
  @ApiProperty({ 
    example: 'João Silva Santos', 
    description: 'Employee full name',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Employee name must be a string' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ 
    example: 'joao.silva.santos@company.com', 
    description: 'Employee email (must be unique)',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({ 
    example: '+55 11 98888-8888', 
    description: 'Employee phone number',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Employee phone must be a string' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Department ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Department ID must be a string' })
  departmentId?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Current Job Title Version ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Current Job Title Version ID must be a string' })
  currentJobTitleVersionId?: string;

  @ApiProperty({ 
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
    description: 'Employment type',
    required: false
  })
  @IsOptional()
  @IsEnum(EmploymentType, { message: 'Invalid employment type' })
  employmentType?: EmploymentType;

  @ApiProperty({ 
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    description: 'Employee status',
    required: false
  })
  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'Invalid employee status' })
  status?: EmployeeStatus;

  @ApiProperty({ 
    example: '2024-01-15T00:00:00.000Z', 
    description: 'Hire date',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid hire date format' })
  hiredAt?: string;

  @ApiProperty({ 
    example: '2024-12-31T00:00:00.000Z', 
    description: 'Leave date',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid leave date format' })
  leftAt?: string;

  @ApiProperty({ 
    example: '00000000-0000-0000-0000-000000000000', 
    description: 'Branch ID',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Branch ID must be a string' })
  branchId?: string;
} 