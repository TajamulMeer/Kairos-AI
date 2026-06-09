import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { Subject } from '../../database/entities/subject.entity';
import { Chapter } from '../../database/entities/chapter.entity';
import { Topic } from '../../database/entities/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Chapter, Topic])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
