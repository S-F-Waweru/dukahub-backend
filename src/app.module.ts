import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MerchantModule } from './modules/merchant/merchant.module';
// import { HealthModule } from './health/health.module';
// import { validate } from './config/env.validation';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
// import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // When set to true, events are delivered asynchronously
      wildcard: false,
      // The delimiter used to segment namespaces
      delimiter: '.',
      // Set this to `true` if you want to emit the newListener event
      newListener: false,
      // Set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // The maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // Show event memory usage (useful for debugging)
      verboseMemoryLeak: true,
      // Disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Database Configuration
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'dukahub_db',
        entities: [__dirname + '/**/*.schema{.ts,.js}'],
        // synchronize: process.env.NODE_ENV !== 'production',
        // logging: process.env.NODE_ENV === 'development',
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    InventoryModule,
    MerchantModule,
    //todo fix the env validation erros
    // HealthModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   validate,
    //   envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    // }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    //Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useValue: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
  ],
})
export class AppModule {}
