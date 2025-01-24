import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // Método para criar uma nova notificação
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  // Método para buscar todas as notificações de um usuário
  async getNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({ where: { userId } });
  }

  // Método para buscar uma notificação específica
  async getNotificationById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });

    if (!notification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }

    return notification;
  }

  // Método para atualizar uma notificação
  async updateNotification(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.getNotificationById(id);

    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  // Método para deletar uma notificação
  async deleteNotification(id: number): Promise<void> {
    const notification = await this.getNotificationById(id);
    await this.notificationRepository.remove(notification);
  }
}
