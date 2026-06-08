import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ExamType } from './exam-type.entity';

@Entity('subjects')
export class Subject extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string; // PHYSICS, CHEMISTRY, BIOLOGY, MATHEMATICS

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, name: 'icon_url' })
  iconUrl: string;

  @Column({ default: '#000000' })
  color: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => ExamType)
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamType;

  @Column({ name: 'exam_type_id' })
  examTypeId: string;
}
