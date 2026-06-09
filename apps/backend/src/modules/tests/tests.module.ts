import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { Test } from '../../database/entities/test.entity';
import { TestAttempt } from '../../database/entities/test-attempt.entity';
import { Question } from '../../database/entities/question.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Test, TestAttempt, Question, StudentProfile])],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService],
})
export class TestsModule {}
