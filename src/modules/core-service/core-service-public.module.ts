import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Public Controllers
import { BranchController } from '@/modules/core-service/public/branch.controller';
import { DepartmentController } from '@/modules/core-service/public/department.controller';
import { JobTitleController } from '@/modules/core-service/public/job-title.controller';
import { JobTitleVersionController } from '@/modules/core-service/public/job-title-version.controller';
import { JobTitleLevelController } from '@/modules/core-service/public/job-title-level.controller';
import { EmployeeController } from '@/modules/core-service/public/employee.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [
    // Public Controllers
    BranchController,
    DepartmentController,
    JobTitleController,
    JobTitleVersionController,
    JobTitleLevelController,
    EmployeeController,
  ],
})
export class CoreServicePublicModule {} 