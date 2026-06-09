import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Payment, PaymentStatus, PaymentMethod } from '../../database/entities/payment.entity';
import { User, SubscriptionTier } from '../../database/entities/user.entity';
import { addMonths } from 'date-fns';

const SUBSCRIPTION_PLANS = [
  { id: 'premium_monthly', tier: SubscriptionTier.PREMIUM, months: 1, amount: 299, name: 'AIRIX Premium — Monthly', description: 'Unlimited AI doubts, Adaptive Learning, Rank Predictor' },
  { id: 'premium_quarterly', tier: SubscriptionTier.PREMIUM, months: 3, amount: 799, name: 'AIRIX Premium — Quarterly', description: 'Best value — save 10%' },
  { id: 'premium_annual', tier: SubscriptionTier.PREMIUM, months: 12, amount: 2499, name: 'AIRIX Premium — Annual', description: 'Maximum savings — best for droppers' },
  { id: 'premium_plus_monthly', tier: SubscriptionTier.PREMIUM_PLUS, months: 1, amount: 499, name: 'AIRIX Premium+ — Monthly', description: 'Voice Mentor + Advanced Analytics + Personalized Coaching' },
  { id: 'premium_plus_annual', tier: SubscriptionTier.PREMIUM_PLUS, months: 12, amount: 3999, name: 'AIRIX Premium+ — Annual', description: 'Complete NEET domination package' },
];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    const keyId = configService.get('app.razorpay.keyId');
    const keySecret = configService.get('app.razorpay.keySecret');
    if (keyId && keySecret) {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  getPlans() { return SUBSCRIPTION_PLANS; }

  async createOrder(userId: string, planId: string) {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) throw new BadRequestException('Invalid plan');

    if (!this.razorpay) throw new BadRequestException('Payment gateway not configured');

    const order = await this.razorpay.orders.create({
      amount: plan.amount * 100, // paise
      currency: 'INR',
      receipt: `airix_${userId}_${Date.now()}`,
      notes: { userId, planId, tier: plan.tier },
    });

    const payment = this.paymentRepo.create({
      userId, amount: plan.amount, currency: 'INR',
      subscriptionTier: plan.tier, subscriptionMonths: plan.months,
      method: PaymentMethod.RAZORPAY, status: PaymentStatus.PENDING,
      razorpayOrderId: order.id,
    });
    await this.paymentRepo.save(payment);

    return { orderId: order.id, amount: plan.amount, currency: 'INR', planName: plan.name, paymentId: payment.id };
  }

  async verifyPayment(paymentId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');

    const expectedSign = crypto
      .createHmac('sha256', this.configService.get('app.razorpay.keySecret') || '')
      .update(`${payment.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSign !== razorpaySignature) {
      await this.paymentRepo.update(payment.id, { status: PaymentStatus.FAILED, failureReason: 'Signature mismatch' });
      throw new BadRequestException('Invalid payment signature');
    }

    await this.paymentRepo.update(payment.id, { status: PaymentStatus.COMPLETED, razorpayPaymentId });

    const expiresAt = addMonths(new Date(), payment.subscriptionMonths);
    await this.userRepo.update(payment.userId, {
      subscriptionTier: payment.subscriptionTier,
      subscriptionExpiresAt: expiresAt,
    });

    return { success: true, expiresAt, tier: payment.subscriptionTier };
  }

  getUserPayments(userId: string) {
    return this.paymentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
