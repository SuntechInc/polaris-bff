import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Admin Controllers
import { CompanyAdminController } from '@/modules/core-service/admin/company-admin.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [
    CompanyAdminController,
  ],
})
export class CoreServiceAdminModule {} 