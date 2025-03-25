import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Request } from 'express';
import { UserRole } from '../user/enums/user-role.enum';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cria uma nova notificação (ADMIN ou SUPER_ADMIN)' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Lista notificações de um usuário (dono ou ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de notificações retornada' })
  async getNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ): Promise<Notification[]> {
    const user = req.user as any;
    const isOwner = user.id === userId;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Acesso negado às notificações de outro usuário.');
    }

    return this.notificationService.getNotifications(userId);
  }

  @Get('single/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Busca uma notificação por ID (ADMIN ou SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  async getNotificationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Notification> {
    return this.notificationService.getNotificationById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Atualiza uma notificação (ADMIN ou SUPER_ADMIN)' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, description: 'Notificação atualizada com sucesso' })
  async updateNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.updateNotification(id, updateNotificationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove uma notificação (ADMIN ou SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Notificação removida com sucesso' })
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.notificationService.deleteNotification(id);
  }
}
