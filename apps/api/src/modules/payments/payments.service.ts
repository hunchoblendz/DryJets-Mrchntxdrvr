import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  CreateRefundDto,
  PaymentQueryDto,
  MerchantOnboardingDto,
  PaymentStatus,
} from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder') {
      this.logger.warn(
        'Stripe secret key not configured. Payment functionality will be limited.',
      );
    }
    this.stripe = new Stripe(stripeSecretKey || '', {
      apiVersion: '2024-11-20.acacia',
    });
  }

  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    const { orderId, amount, currency, customerId, description, metadata } =
      createPaymentIntentDto;

    // Verify order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { user: true } },
        merchant: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Check if payment already exists for this order
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        status: { in: ['PENDING', 'PROCESSING', 'SUCCEEDED'] },
      },
    });

    if (existingPayment) {
      throw new BadRequestException(
        'A payment already exists for this order',
      );
    }

    try {
      // Create Stripe customer if doesn't exist
      let stripeCustomerId = order.customer.user.stripeCustomerId;
      if (!stripeCustomerId) {
        const stripeCustomer = await this.stripe.customers.create({
          email: order.customer.user.email,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          metadata: {
            userId: order.customer.userId,
            customerId: order.customer.id,
          },
        });
        stripeCustomerId = stripeCustomer.id;

        // Update user with Stripe customer ID
        await this.prisma.user.update({
          where: { id: order.customer.userId },
          data: { stripeCustomerId },
        });
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        customer: stripeCustomerId,
        description:
          description || `Payment for Order ${order.orderNumber}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          merchantId: order.merchantId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      const payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: amount / 100, // Convert cents to dollars
          currency: currency.toUpperCase(),
          method: 'CARD',
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          metadata: {
            stripeCustomerId,
            ...metadata,
          } as any,
        },
      });

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      throw new InternalServerErrorException(
        'Failed to create payment intent',
      );
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    const { paymentIntentId, paymentMethodId } = confirmPaymentDto;

    try {
      // Find payment in database
      const payment = await this.prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { order: true },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Retrieve payment intent from Stripe
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update payment status
        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            processedAt: new Date(),
          },
        });

        // Update order status to PAYMENT_CONFIRMED
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAYMENT_CONFIRMED' },
        });

        // Create order status history
        await this.prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: 'PAYMENT_CONFIRMED',
            notes: 'Payment confirmed via Stripe',
          },
        });

        return updatedPayment;
      }

      // If not succeeded, confirm it if payment method provided
      if (paymentMethodId && paymentIntent.status === 'requires_payment_method') {
        await this.stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        });

        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PROCESSING' },
        });

        return updatedPayment;
      }

      return payment;
    } catch (error) {
      this.logger.error('Error confirming payment:', error);
      throw new InternalServerErrorException('Failed to confirm payment');
    }
  }

  /**
   * Process refund
   */
  async createRefund(createRefundDto: CreateRefundDto) {
    const { paymentId, amount, reason } = createRefundDto;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestException('Can only refund succeeded payments');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('No Stripe payment intent found');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount) : undefined, // Amount in cents
        reason: reason as Stripe.RefundCreateParams.Reason,
      });

      // Update payment status
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          metadata: {
            ...(payment.metadata as any),
            stripeRefundId: refund.id,
            refundReason: reason,
          } as any,
        },
      });

      // Update order status
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'REFUNDED' },
      });

      // Create order status history
      await this.prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: 'REFUNDED',
          notes: reason || 'Payment refunded',
        },
      });

      return updatedPayment;
    } catch (error) {
      this.logger.error('Error creating refund:', error);
      throw new InternalServerErrorException('Failed to create refund');
    }
  }

  /**
   * Get payment by ID
   */
  async findPaymentById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            merchant: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * List payments with filtering
   */
  async findPayments(query: PaymentQueryDto) {
    const { orderId, customerId, status, page = 1, limit = 20 } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    if (customerId) {
      where.order = {
        customerId,
      };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              merchant: {
                select: {
                  businessName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(signature: string, payload: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      this.logger.warn('Stripe webhook secret not configured');
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid signature');
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Create Stripe Connect account for merchant
   */
  async createMerchantConnectAccount(dto: MerchantOnboardingDto) {
    const { merchantId, email, returnUrl, refreshUrl } = dto;

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    try {
      // Create Connected Account
      const account = await this.stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'company',
        metadata: {
          merchantId,
        },
      });

      // Update merchant with Stripe account ID
      await this.prisma.merchant.update({
        where: { id: merchantId },
        data: { stripeAccountId: account.id },
      });

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      this.logger.error('Error creating Connect account:', error);
      throw new InternalServerErrorException(
        'Failed to create merchant account',
      );
    }
  }

  /**
   * Private helper methods
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment && payment.status !== 'SUCCEEDED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          processedAt: new Date(),
        },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_CONFIRMED' },
      });

      await this.prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: 'PAYMENT_CONFIRMED',
          notes: 'Payment confirmed via webhook',
        },
      });
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    if (typeof charge.payment_intent === 'string') {
      const payment = await this.prisma.payment.findFirst({
        where: { stripePaymentIntentId: charge.payment_intent },
      });

      if (payment && payment.status !== 'REFUNDED') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
          },
        });

        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'REFUNDED' },
        });
      }
    }
  }
}
