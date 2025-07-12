// src/routes/bff/bff.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompanyController } from './core-service/company.routes';
import { AuthController } from './auth-service/auth.route';
// import { AdminController } from './admin/admin.controller';
import { DepartmentController } from './core-service/departments.route';
import { BranchController } from './core-service/branch.routes';

@Module({
  imports: [HttpModule],
  controllers: [CompanyController, BranchController ,  DepartmentController, AuthController],
})
export class BffModule {}
