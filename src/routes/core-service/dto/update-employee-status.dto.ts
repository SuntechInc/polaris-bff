import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EmployeeStatus } from './create-employee.dto';

export class UpdateEmployeeStatusGatewayDto {
  @ApiProperty({ 
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    description: 'New employee status',
    required: true
  })
  @IsEnum(EmployeeStatus, { message: 'Invalid employee status' })
  @IsNotEmpty({ message: 'Employee status is required' })
  status: EmployeeStatus;
} 