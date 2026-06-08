import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum NotificationType {
  STUDY_REMINDER = 'study_reminder',
  TEST_REMINDER = 'test_reminder',
  REVISION_DUE = 'revision_due',
  ACHIEVEMENT = 'achievement',
  STREAK_REMINDER = 'streak_reminder',
  AI_INSIGHT = 'ai_insight',
  RANK_UPDATE = 'rank_update',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;
}
