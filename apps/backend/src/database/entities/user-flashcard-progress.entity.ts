import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Flashcard } from './flashcard.entity';

@Entity('user_flashcard_progress')
export class UserFlashcardProgress extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Flashcard)
  @JoinColumn({ name: 'flashcard_id' })
  flashcard: Flashcard;

  @Column({ name: 'flashcard_id' })
  flashcardId: string;

  // Spaced Repetition (SM-2 Algorithm)
  @Column({ name: 'ease_factor', type: 'decimal', precision: 4, scale: 2, default: 2.5 })
  easeFactor: number;

  @Column({ name: 'interval_days', default: 1 })
  intervalDays: number;

  @Column({ name: 'repetitions', default: 0 })
  repetitions: number;

  @Column({ name: 'next_review_at' })
  nextReviewAt: Date;

  @Column({ name: 'last_reviewed_at', nullable: true })
  lastReviewedAt: Date;

  @Column({ name: 'times_reviewed', default: 0 })
  timesReviewed: number;

  @Column({ name: 'times_correct', default: 0 })
  timesCorrect: number;
}
