import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { config } from './common/config/confg';
import { APP_GUARD } from '@nestjs/core';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    // set rate limiter to 10 reqs per second
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    AuthModule,
    MongooseModule.forRoot(config.MONGO_URI),
    ConfigModule.forRoot({ isGlobal: true }),
    AccountModule,
    TransactionModule,
  ],
  controllers: [],
  providers: [
    // bind rate limiter guard globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
