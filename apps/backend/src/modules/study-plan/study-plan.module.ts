import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanController } from './study-plan.controller';
import { StudyPlanService } from './study-plan.service';
import { StudyPlan } from '../../database/entities/study-plan.entity';
import { StudySession } from '../../database/entities/study-session.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan, StudySession, StudentProfile])],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
  exports: [StudyPlanService],
})
export class StudyPlanModule {}
