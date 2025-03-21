import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Notifications') // 🔹 Agrupa os endpoints no Swagger
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova notificação' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Lista notificações de um usuário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações retornada' })
  async getNotifications(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Notification[]> {
    return this.notificationService.getNotifications(userId);
  }

  @Get('single/:id')
  @ApiOperation({ summary: 'Busca uma notificação por ID' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async getNotificationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Notification> {
    return this.notificationService.getNotificationById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma notificação' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, description: 'Notificação atualizada com sucesso' })
  async updateNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.updateNotification(id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma notificação' })
  @ApiResponse({ status: 200, description: 'Notificação removida com sucesso' })
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.notificationService.deleteNotification(id);
  }
}
