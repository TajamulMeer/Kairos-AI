import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getUserNotifications(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    return this.notifRepo.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  async markAsRead(notifId: string, userId: string) {
    await this.notifRepo.update({ id: notifId, userId }, { isRead: true, readAt: new Date() });
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const tokens = user?.fcmTokens || [];
    if (!tokens.length) return;

    try {
      if (admin.apps.length) {
        await admin.messaging().sendEachForMulticast({ tokens, notification: { title, body }, data });
      }
    } catch (err) {
      this.logger.error(`FCM push failed for user ${userId}: ${err.message}`);
    }
  }

  async createNotification(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, any>) {
    const notif = this.notifRepo.create({ userId, type, title, body, data, sentAt: new Date() });
    await this.notifRepo.save(notif);
    await this.sendPushNotification(userId, title, body, data as any);
    return notif;
  }

  getUnreadCount(userId: string) {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async registerFcmToken(userId: string, token: string, platform: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const tokens: string[] = user.fcmTokens || [];
    if (!tokens.includes(token)) {
      tokens.push(token);
      await this.userRepo.update(userId, { fcmTokens: tokens });
    }
    return { registered: true };
  }
}
