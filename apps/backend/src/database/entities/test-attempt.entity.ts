import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Test } from './test.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  TIMED_OUT = 'timed_out',
}

@Entity('test_attempts')
export class TestAttempt extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'test_id' })
  testId: string;

  @Column({ type: 'enum', enum: AttemptStatus, default: AttemptStatus.IN_PROGRESS })
  status: AttemptStatus;

  @Column({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'time_taken_seconds', default: 0 })
  timeTakenSeconds: number;

  @Column({ name: 'score', type: 'decimal', precision: 8, scale: 2, default: 0 })
  score: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 8, scale: 2, default: 0 })
  maxScore: number;

  @Column({ name: 'correct_count', default: 0 })
  correctCount: number;

  @Column({ name: 'wrong_count', default: 0 })
  wrongCount: number;

  @Column({ name: 'skipped_count', default: 0 })
  skippedCount: number;

  @Column({ name: 'accuracy', type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracy: number;

  @Column({ type: 'jsonb', nullable: true })
  responses: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    timeTakenSeconds: number;
    isGuessed: boolean;
    marksEarned: number;
  }>;

  @Column({ type: 'jsonb', nullable: true, name: 'subject_scores' })
  subjectScores: Record<string, { score: number; correct: number; wrong: number; accuracy: number }>;

  @Column({ type: 'jsonb', nullable: true, name: 'ai_analysis' })
  aiAnalysis: Record<string, any>;

  @Column({ name: 'percentile', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentile: number;

  @Column({ name: 'predicted_rank', nullable: true })
  predictedRank: number;
}
