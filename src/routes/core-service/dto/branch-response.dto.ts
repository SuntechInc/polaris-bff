import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto {
  @ApiProperty({ 
    example: 'cmdqtvliz0005i0isxzsqes2x', 
    description: 'Unique identifier for the branch' 
  })
  id: string;

  @ApiProperty({ 
    example: '12345678000199', 
    description: 'Branch tax ID (CNPJ)' 
  })
  taxId: string;

  @ApiProperty({ 
    example: 'Center Branch', 
    description: 'Trading name of the branch' 
  })
  tradingName: string;

  @ApiProperty({ 
    example: 'Center Branch LTDA', 
    description: 'Legal name of the branch' 
  })
  legalName: string;

  @ApiProperty({ 
    example: 'BR001', 
    description: 'Branch code' 
  })
  code: string;

  @ApiProperty({ 
    example: 'contact@branch.com', 
    description: 'Branch email' 
  })
  email: string;

  @ApiProperty({ 
    example: '+55 11 99999-9999', 
    description: 'Branch phone number',
    required: false
  })
  phone?: string;

  @ApiProperty({ 
    example: 'John Doe', 
    description: 'Name of the person responsible for the branch',
    required: false
  })
  responsible?: string;

  @ApiProperty({ 
    example: false, 
    description: 'Indicates if this is the headquarters branch' 
  })
  isHeadquarter: boolean;

  @ApiProperty({ 
    example: 'ACTIVE', 
    description: 'Branch status',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
  })
  status: string;

  @ApiProperty({ 
    example: 'cmcwpsyye000010mbjdk0azaw', 
    description: 'ID of the company this branch belongs to' 
  })
  companyId: string;

  @ApiProperty({ 
    example: '2025-07-31T03:21:24.155Z', 
    description: 'Timestamp when the branch was created' 
  })
  createdAt: string;

  @ApiProperty({ 
    example: '2025-07-31T03:21:24.155Z', 
    description: 'Timestamp when the branch was last updated' 
  })
  updatedAt: string;
} 