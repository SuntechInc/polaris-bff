import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class HealthController {
  @Get('healthz')
  @HttpCode(200)
  @ApiOperation({ summary: 'Gateway health check', description: 'Returns the health status of the API Gateway. Use this endpoint to verify if the Gateway is running and healthy.' })
  @ApiOkResponse({
    description: 'Gateway health check response',
    schema: {
      example: {
        'service-name': 'aurora-bff',
        status: 200,
        timestamp: '2024-06-25T12:34:56.789Z'
      }
    }
  })
  healthCheck() {
    return {
        'service-name': 'aurora-bff',
        'status': HttpStatus.OK,
        'timestamp': new Date().toISOString(),
    }
  }
}
