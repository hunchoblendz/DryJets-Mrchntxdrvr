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
    // DriversModule,  // Temporarily disabled - has compilation errors
    // PaymentsModule,  // Temporarily disabled - has compilation errors
    // NotificationsModule,  // Temporarily disabled - has compilation errors
    AnalyticsModule,
    EventsModule,
    IotModule,
  ],
})
export class AppModule {}
