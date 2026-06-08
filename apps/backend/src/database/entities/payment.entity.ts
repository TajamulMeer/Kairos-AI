import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { SubscriptionTier } from './user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  RAZORPAY = 'razorpay',
  GOOGLE_PLAY = 'google_play',
  APPLE_PAY = 'apple_pay',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ name: 'subscription_tier', type: 'enum', enum: SubscriptionTier })
  subscriptionTier: SubscriptionTier;

  @Column({ name: 'subscription_months', default: 1 })
  subscriptionMonths: number;

  @Column({ name: 'razorpay_order_id', nullable: true })
  razorpayOrderId: string;

  @Column({ name: 'razorpay_payment_id', nullable: true })
  razorpayPaymentId: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any>;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;
}
