import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
// import { DriversModule } from './modules/drivers/drivers.module';  // Disabled
// import { PaymentsModule } from './modules/payments/payments.module';  // Disabled
// import { NotificationsModule } from './modules/notifications/notifications.module';  // Disabled
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EventsModule } from './modules/events/events.module';
import { IotModule } from './modules/iot/iot.module';
import { BusinessAccountsModule } from './modules/business-accounts/business-accounts.module';
import { EnterpriseModule } from './modules/enterprise/enterprise.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    OrdersModule,
    MerchantsModule,
    BusinessAccountsModule,
    EnterpriseModule,
    InvoicesModule,
    MarketingModule,
    DeliveryModule,
    // DriversModule,  // Temporarily disabled - has compilation errors
    // PaymentsModule,  // Temporarily disabled - has compilation errors
    // NotificationsModule,  // Temporarily disabled - has compilation errors
    AnalyticsModule,
    EventsModule,
    IotModule,
  ],
})
export class AppModule {}
