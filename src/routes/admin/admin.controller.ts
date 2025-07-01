import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../../guards/admin.guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { UserPayload } from '../../interfaces/user.interface';

// DTOs de exemplo
class CreateAdminDto {
  email: string;
  name: string;
  companyId?: string;
}

class UpdateAdminDto {
  name?: string;
  companyId?: string;
}

@ApiTags('Admin Management')
@Controller('admin')
@ApiBearerAuth()
export class AdminController {

  @ApiOperation({ summary: 'Rota administrativa de teste - apenas GLOBAL_ADMIN' })
  @UseGuards(AdminGuard)
  @Get('test')
  async adminTestRoute(@CurrentUser() currentUser: UserPayload) {
    return {
      message: 'Esta é uma rota administrativa de teste!',
      user: currentUser.email,
      userType: currentUser.userType,
      timestamp: new Date().toISOString()
    };
  }

  @ApiOperation({ summary: 'Criar novo admin - apenas GLOBAL_ADMIN' })
  @UseGuards(AdminGuard)
  @Post()
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @CurrentUser() currentUser: UserPayload
  ) {
    return {
      message: 'Admin criado com sucesso',
      createdBy: currentUser.email,
      admin: createAdminDto
    };
  }

  @ApiOperation({ summary: 'Listar admins - qualquer usuário autenticado' })
  @Get()
  async listAdmins(@CurrentUser() currentUser: UserPayload) {
    return {
      message: 'Lista de admins',
      requestedBy: currentUser.email,
      userType: currentUser.userType,
      admins: [
        { id: '1', email: 'admin1@example.com', userType: 'COMPANY_ADMIN' },
        { id: '2', email: 'admin2@example.com', userType: 'COMPANY_ADMIN' }
      ]
    };
  }

  @ApiOperation({ summary: 'Atualizar admin - apenas GLOBAL_ADMIN' })
  @UseGuards(AdminGuard)
  @Put(':id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @CurrentUser() currentUser: UserPayload
  ) {
    return {
      message: 'Admin atualizado com sucesso',
      updatedBy: currentUser.email,
      adminId: id,
      updates: updateAdminDto
    };
  }

  @ApiOperation({ summary: 'Deletar admin - apenas GLOBAL_ADMIN' })
  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteAdmin(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload
  ) {
    return {
      message: 'Admin deletado com sucesso',
      deletedBy: currentUser.email,
      adminId: id
    };
  }

  @ApiOperation({ summary: 'Dashboard de admin - qualquer usuário autenticado' })
  @Get('dashboard')
  async getDashboard(@CurrentUser() currentUser: UserPayload) {
    return {
      message: 'Dashboard do admin',
      user: {
        email: currentUser.email,
        userType: currentUser.userType,
        companyId: currentUser.companyId,
        actionCompanyId: currentUser.actionCompanyId
      },
      stats: {
        totalUsers: 150,
        activeUsers: 120,
        pendingApprovals: 5
      }
    };
  }
} 