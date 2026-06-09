import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from '../../database/entities/question.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, StudentProfile])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
