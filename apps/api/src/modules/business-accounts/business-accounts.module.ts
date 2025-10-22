import { Module } from '@nestjs/common';
import { BusinessAccountsController } from './business-accounts.controller';
import { BusinessAccountsService } from './business-accounts.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessAccountsController],
  providers: [BusinessAccountsService],
  exports: [BusinessAccountsService],
})
export class BusinessAccountsModule {}
