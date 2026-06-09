import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('plans') getPlans() { return this.paymentsService.getPlans(); }
  @Get('history') getHistory(@Request() req: any) { return this.paymentsService.getUserPayments(req.user.id); }

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order for subscription' })
  createOrder(@Request() req: any, @Body('planId') planId: string) {
    return this.paymentsService.createOrder(req.user.id, planId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment and activate subscription' })
  verify(@Body() body: { paymentId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.paymentsService.verifyPayment(body.paymentId, body.razorpayPaymentId, body.razorpaySignature);
  }
}
