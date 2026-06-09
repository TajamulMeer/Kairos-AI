import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TestAttempt } from '../../database/entities/test-attempt.entity';
import { StudySession } from '../../database/entities/study-session.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestAttempt, StudySession, StudentProfile])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
