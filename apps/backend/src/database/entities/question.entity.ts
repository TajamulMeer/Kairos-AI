import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Subject } from './subject.entity';
import { Chapter } from './chapter.entity';
import { Topic } from './topic.entity';
import { ExamType } from './exam-type.entity';

export enum QuestionType {
  MCQ = 'mcq',
  ASSERTION_REASON = 'assertion_reason',
  MATCH_COLUMN = 'match_column',
  INTEGER = 'integer',
  MULTI_CORRECT = 'multi_correct',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionLanguage {
  ENGLISH = 'en',
  HINDI = 'hi',
  BOTH = 'both',
}

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true, name: 'content_hindi' })
  contentHindi: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.MCQ })
  type: QuestionType;

  @Column({ type: 'enum', enum: DifficultyLevel, default: DifficultyLevel.MEDIUM })
  difficulty: DifficultyLevel;

  @Column({ type: 'jsonb' })
  options: Array<{ id: string; text: string; textHindi?: string; imageUrl?: string }>;

  @Column({ name: 'correct_option_id' })
  correctOptionId: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'text', nullable: true, name: 'explanation_hindi' })
  explanationHindi: string;

  @Column({ type: 'text', nullable: true, name: 'explanation_image_url' })
  explanationImageUrl: string;

  @Column({ name: 'neet_year', nullable: true })
  neetYear: number;

  @Column({ name: 'neet_weightage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  neetWeightage: number;

  @Column({ name: 'avg_time_seconds', default: 90 })
  avgTimeSeconds: number;

  @Column({ name: 'times_attempted', default: 0 })
  timesAttempted: number;

  @Column({ name: 'times_correct', default: 0 })
  timesCorrect: number;

  @Column({ name: 'is_ncert', default: false })
  isNcert: boolean;

  @Column({ name: 'is_pyq', default: false })
  isPyq: boolean; // Previous Year Question

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id' })
  @Index()
  subjectId: string;

  @ManyToOne(() => Chapter)
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @Column({ name: 'chapter_id' })
  @Index()
  chapterId: string;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ name: 'topic_id', nullable: true })
  topicId: string;

  @ManyToOne(() => ExamType)
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamType;

  @Column({ name: 'exam_type_id' })
  examTypeId: string;
}
