import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum PlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  EXPIRED = 'expired',
}

@Entity('study_plans')
export class StudyPlan extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'target_exam_date', type: 'date', nullable: true })
  targetExamDate: Date;

  @Column({ type: 'enum', enum: PlanStatus, default: PlanStatus.ACTIVE })
  status: PlanStatus;

  @Column({ name: 'daily_study_hours', type: 'decimal', precision: 4, scale: 2, default: 8 })
  dailyStudyHours: number;

  @Column({ name: 'is_ai_generated', default: false })
  isAiGenerated: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'ai_reasoning' })
  aiReasoning: string;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;
}
