import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Subject } from './subject.entity';

@Entity('chapters')
export class Chapter extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'neet_weightage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  neetWeightage: number;

  @Column({ name: 'estimated_hours', default: 0 })
  estimatedHours: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id' })
  subjectId: string;
}
