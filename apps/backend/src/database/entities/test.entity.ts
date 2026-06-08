import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { ExamType } from './exam-type.entity';

export enum TestType {
  FULL_LENGTH = 'full_length',
  CHAPTER = 'chapter',
  SUBJECT = 'subject',
  CUSTOM = 'custom',
  ADAPTIVE = 'adaptive',
  PRACTICE = 'practice',
}

export enum TestStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('tests')
export class Test extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TestType, default: TestType.PRACTICE })
  type: TestType;

  @Column({ type: 'enum', enum: TestStatus, default: TestStatus.DRAFT })
  status: TestStatus;

  @Column({ name: 'duration_minutes', default: 180 })
  durationMinutes: number;

  @Column({ name: 'total_questions', default: 0 })
  totalQuestions: number;

  @Column({ name: 'total_marks', default: 0 })
  totalMarks: number;

  @Column({ name: 'marks_per_correct', type: 'decimal', precision: 4, scale: 2, default: 4 })
  marksPerCorrect: number;

  @Column({ name: 'negative_marks', type: 'decimal', precision: 4, scale: 2, default: 1 })
  negativeMarks: number;

  @Column({ type: 'jsonb', nullable: true, name: 'subject_config' })
  subjectConfig: Array<{ subjectId: string; questionCount: number; marks: number }>;

  @Column({ type: 'jsonb', nullable: true, name: 'question_ids' })
  questionIds: string[];

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @ManyToOne(() => ExamType)
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamType;

  @Column({ name: 'exam_type_id' })
  examTypeId: string;
}
