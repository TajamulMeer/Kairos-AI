import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('student_profiles')
export class StudentProfile extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  // AI-tracked metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'overall_accuracy' })
  overallAccuracy: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'avg_speed_per_question' })
  avgSpeedPerQuestion: number;

  @Column({ name: 'total_study_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalStudyHours: number;

  @Column({ name: 'total_questions_attempted', default: 0 })
  totalQuestionsAttempted: number;

  @Column({ name: 'total_questions_correct', default: 0 })
  totalQuestionsCorrect: number;

  @Column({ name: 'current_streak', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', default: 0 })
  longestStreak: number;

  @Column({ name: 'total_xp', default: 0 })
  totalXp: number;

  @Column({ name: 'current_level', default: 1 })
  currentLevel: number;

  @Column({ name: 'predicted_score', nullable: true, type: 'decimal', precision: 6, scale: 2 })
  predictedScore: number;

  @Column({ name: 'predicted_rank', nullable: true })
  predictedRank: number;

  @Column({ name: 'motivation_level', type: 'int', default: 5 })
  motivationLevel: number; // 1-10

  @Column({ type: 'jsonb', nullable: true, name: 'subject_accuracy' })
  subjectAccuracy: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true, name: 'weak_topics' })
  weakTopics: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'strong_topics' })
  strongTopics: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'ai_insights' })
  aiInsights: Record<string, any>;

  @Column({ name: 'last_ai_analysis_at', nullable: true })
  lastAiAnalysisAt: Date;

  @Column({ name: 'burnout_risk_score', type: 'decimal', precision: 3, scale: 2, default: 0 })
  burnoutRiskScore: number;

  @Column({ name: 'drop_risk_score', type: 'decimal', precision: 3, scale: 2, default: 0 })
  dropRiskScore: number;
}
