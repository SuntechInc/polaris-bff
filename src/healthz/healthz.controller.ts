import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

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
