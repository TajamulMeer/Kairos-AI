import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevisionController } from './revision.controller';
import { RevisionService } from './revision.service';
import { UserFlashcardProgress } from '../../database/entities/user-flashcard-progress.entity';
import { Flashcard } from '../../database/entities/flashcard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFlashcardProgress, Flashcard])],
  controllers: [RevisionController],
  providers: [RevisionService],
  exports: [RevisionService],
})
export class RevisionModule {}
