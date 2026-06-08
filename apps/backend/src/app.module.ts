import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { redisStore } from 'cache-manager-redis-yet';

import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AiModule } from './modules/ai/ai.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestsModule } from './modules/tests/tests.module';
import { StudyPlanModule } from './modules/study-plan/study-plan.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RevisionModule } from './modules/revision/revision.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StorageModule } from './modules/storage/storage.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) =>
              `${timestamp} [${context || 'App'}] ${level}: ${message}`,
            ),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        return { store: await redisStore({ url: redisUrl }), ttl: 300 };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { ttl: config.get('THROTTLE_TTL', 60) * 1000, limit: config.get('THROTTLE_LIMIT', 100) },
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: { host: config.get('REDIS_HOST', 'localhost'), port: config.get('REDIS_PORT', 6379) },
      }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    HealthModule,
    AuthModule,
    UsersModule,
    AiModule,
    QuestionsModule,
    TestsModule,
    StudyPlanModule,
    AnalyticsModule,
    RevisionModule,
    FlashcardsModule,
    LeaderboardModule,
    GamificationModule,
    NotificationsModule,
    PaymentsModule,
    StorageModule,
    SubjectsModule,
    ExamsModule,
  ],
})
export class AppModule {}
