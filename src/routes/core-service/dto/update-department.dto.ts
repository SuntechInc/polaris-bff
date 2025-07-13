import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DepartmentStatus } from './create-department.dto';

export class UpdateDepartmentGatewayDto {
  @ApiProperty({ description: 'Department name', minLength: 3, required: false, example: 'Updated IT Department' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'the name must be at least 3 characters long' })
  name?: string;

  @ApiProperty({ description: 'Department description', required: false, example: 'New description' })
  @IsString({ message: 'the description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Department code', required: false, minLength: 3, example: 'IT-NEW' })
  @IsString({ message: 'the code must be a string' })
  @IsOptional()
  @MinLength(3, { message: 'the code must be at least 3 characters long' })
  code?: string;

  @ApiProperty({ description: 'Responsible name', required: false, example: 'Maria Santos' })
  @IsString({ message: 'the responsibleName must be a string' })
  @IsOptional()
  responsibleName?: string;

  @ApiProperty({ description: 'Responsible email', required: false, example: 'maria.santos@empresa.com' })
  @IsString({ message: 'the responsibleEmail must be a string' })
  @IsOptional()
  responsibleEmail?: string;

  @ApiProperty({ description: 'Department status', enum: DepartmentStatus, required: false, example: 'ACTIVE' })
  @IsEnum(DepartmentStatus)
  @IsOptional()
  status?: DepartmentStatus;

  @ApiProperty({ description: 'Branch ID', required: false, example: 'clx1234567890abcdef' })
  @IsUUID()
  @IsOptional()
  branchId?: string;
} 