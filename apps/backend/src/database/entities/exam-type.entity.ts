import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('exam_types')
export class ExamType extends BaseEntity {
  @Column({ unique: true })
  code: string; // NEET, JEE, CUET, UPSC, SSC, BANKING

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
