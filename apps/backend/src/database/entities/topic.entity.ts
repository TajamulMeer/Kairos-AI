import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Chapter } from './chapter.entity';

@Entity('topics')
export class Topic extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Chapter)
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @Column({ name: 'chapter_id' })
  chapterId: string;
}
