import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { Chapter } from './chapter.entity';

export enum SessionType {
  STUDY = 'study',
  REVISION = 'revision',
  PRACTICE = 'practice',
  TEST = 'test',
}

@Entity('study_sessions')
export class StudySession extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: SessionType, default: SessionType.STUDY })
  type: SessionType;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id', nullable: true })
  subjectId: string;

  @ManyToOne(() => Chapter, { nullable: true })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @Column({ name: 'chapter_id', nullable: true })
  chapterId: string;

  @Column({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @Column({ name: 'duration_minutes', default: 0 })
  durationMinutes: number;

  @Column({ name: 'xp_earned', default: 0 })
  xpEarned: number;

  @Column({ type: 'jsonb', nullable: true })
  notes: string;
}
