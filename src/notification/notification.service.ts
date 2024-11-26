import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(userId: number, message: string): Promise<Notification> {
    return this.notificationRepository.save({ userId, message });
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({ where: { userId } });
  }
}