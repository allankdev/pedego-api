import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Cria uma nova notificação
  @Post()
  async createNotification(
    @Body('userId') userId: number,
    @Body('message') message: string,
  ): Promise<Notification> {
    return this.notificationService.createNotification(userId, message);
  }

  // Obtém as notificações de um usuário
  @Get(':userId')
  async getNotifications(@Param('userId') userId: number): Promise<Notification[]> {
    return this.notificationService.getNotifications(userId);
  }
}
