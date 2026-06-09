import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { UserFlashcardProgress } from '../../database/entities/user-flashcard-progress.entity';
import { addDays } from 'date-fns';

@Injectable()
export class RevisionService {
  constructor(@InjectRepository(UserFlashcardProgress) private progressRepo: Repository<UserFlashcardProgress>) {}

  getDueCards(userId: string, limit = 20) {
    return this.progressRepo.find({
      where: { userId, nextReviewAt: LessThanOrEqual(new Date()) },
      relations: ['flashcard'], take: limit, order: { nextReviewAt: 'ASC' },
    });
  }

  async reviewCard(userId: string, flashcardId: string, quality: number) {
    let p = await this.progressRepo.findOne({ where: { userId, flashcardId } });
    if (!p) p = this.progressRepo.create({ userId, flashcardId, easeFactor: 2.5, intervalDays: 1, repetitions: 0, nextReviewAt: new Date() });

    let { easeFactor, intervalDays, repetitions } = p;
    if (quality >= 2) {
      intervalDays = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(intervalDays * easeFactor);
      repetitions++;
    } else {
      repetitions = 0;
      intervalDays = 1;
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    const nextReviewAt = addDays(new Date(), intervalDays);
    await this.progressRepo.save({ ...p, easeFactor, intervalDays, repetitions, nextReviewAt, lastReviewedAt: new Date(), timesReviewed: (p.timesReviewed || 0) + 1 });
    return { nextReviewAt, intervalDays };
  }

  async enrollFlashcard(userId: string, flashcardId: string) {
    const existing = await this.progressRepo.findOne({ where: { userId, flashcardId } });
    if (existing) return existing;
    return this.progressRepo.save(this.progressRepo.create({ userId, flashcardId, easeFactor: 2.5, intervalDays: 1, repetitions: 0, nextReviewAt: new Date() }));
  }
}
