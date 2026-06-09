import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamType } from '../../database/entities/exam-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamType])],
  exports: [],
})
export class ExamsModule {}
