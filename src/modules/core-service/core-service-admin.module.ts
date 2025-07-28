import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Admin Controllers
import { CompanyAdminController } from '@/modules/core-service/admin/company-admin.controller';

// Auth Module (needed for both public and admin docs)
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule],
  controllers: [
    CompanyAdminController,
  ],
})
export class CoreServiceAdminModule {} 