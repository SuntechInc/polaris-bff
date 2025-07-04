import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class HealthController {
  @Get('healthz')
  @HttpCode(200)
  healthCheck() {
    return {
        'service-name': 'aurora-bff',
        'status': HttpStatus.OK,
        'timestamp': new Date().toISOString(),
    }
  }
}
