// src/routes/bff/bff.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompanyController } from './core-service/company.routes';
import { AuthController } from './auth-service/auth.route';
// import { AdminController } from './admin/admin.controller';
import { DepartmentController } from './core-service/departments.route';
import { BranchController } from './core-service/branch.routes';
import { JobTitleController } from './core-service/job-title.routes';
import { JobTitleVersionController } from './core-service/job-title-versions.routes';
import { JobTitleLevelController } from './core-service/job-title-level.routes';

@Module({
  imports: [HttpModule],
  controllers: [CompanyController, BranchController, DepartmentController, JobTitleController, JobTitleVersionController, JobTitleLevelController, AuthController],
})
export class BffModule {}
