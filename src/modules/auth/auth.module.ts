import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Auth Controllers
import { AuthController } from '@/routes/auth-service/auth.route';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [
    AuthController,
  ],
})
export class AuthModule {} 