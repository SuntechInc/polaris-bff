// src/routes/bff/bff.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompanyController } from './core-service/company.routes';
import { AuthController } from './auth-service/auth.route';
import { AdminController } from './admin/admin.controller';
import { IronSessionService } from '../services/iron-session.service';

@Module({
  imports: [HttpModule],
  controllers: [CompanyController, AuthController, AdminController],
  providers: [IronSessionService],
  exports: [IronSessionService],
})
export class BffModule {}
