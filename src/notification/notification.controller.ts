import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Cria uma nova notificação
  @Post()
  async createNotification(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationService.createNotification(createNotificationDto);
  }

  // Obtém as notificações de um usuário
  @Get(':userId')
  async getNotifications(@Param('userId') userId: number): Promise<Notification[]> {
    return this.notificationService.getNotifications(userId);
  }

  // Obtém uma notificação específica
  @Get('single/:id')
  async getNotificationById(@Param('id') id: number): Promise<Notification> {
    return this.notificationService.getNotificationById(id);
  }

  // Atualiza uma notificação
  @Put(':id')
  async updateNotification(@Param('id') id: number, @Body() updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    return this.notificationService.updateNotification(id, updateNotificationDto);
  }

  // Remove uma notificação
  @Delete(':id')
  async deleteNotification(@Param('id') id: number): Promise<void> {
    return this.notificationService.deleteNotification(id);
  }
}
