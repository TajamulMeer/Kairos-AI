import { Entity, Column, OneToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
}

export enum ExamTarget {
  NEET = 'NEET',
  JEE = 'JEE',
  CUET = 'CUET',
  UPSC = 'UPSC',
  SSC = 'SSC',
}

export enum ClassYear {
  CLASS_11 = 'class_11',
  CLASS_12 = 'class_12',
  DROPPER = 'dropper',
  REPEATER = 'repeater',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'firebase_uid', unique: true, nullable: true })
  @Index()
  firebaseUid: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE, name: 'subscription_tier' })
  subscriptionTier: SubscriptionTier;

  @Column({ name: 'subscription_expires_at', nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ type: 'enum', enum: ExamTarget, default: ExamTarget.NEET, name: 'exam_target' })
  examTarget: ExamTarget;

  @Column({ type: 'enum', enum: ClassYear, nullable: true, name: 'class_year' })
  classYear: ClassYear;

  @Column({ name: 'target_year', nullable: true })
  targetYear: number;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, name: 'coaching_institute' })
  coachingInstitute: string;

  @Column({ default: 'en', name: 'preferred_language' })
  preferredLanguage: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified: boolean;

  @Column({ name: 'last_active_at', nullable: true })
  lastActiveAt: Date;

  @Column({ name: 'onboarding_completed', default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'fcm_tokens' })
  fcmTokens: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'notification_preferences' })
  notificationPreferences: Record<string, boolean>;
}
