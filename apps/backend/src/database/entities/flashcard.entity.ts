import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Topic } from './topic.entity';
import { Chapter } from './chapter.entity';

export enum FlashcardDifficulty {
  AGAIN = 0,
  HARD = 1,
  GOOD = 2,
  EASY = 3,
}

@Entity('flashcards')
export class Flashcard extends BaseEntity {
  @Column({ type: 'text' })
  front: string;

  @Column({ type: 'text' })
  back: string;

  @Column({ nullable: true, name: 'front_image_url' })
  frontImageUrl: string;

  @Column({ nullable: true, name: 'back_image_url' })
  backImageUrl: string;

  @Column({ name: 'is_ai_generated', default: false })
  isAiGenerated: boolean;

  @Column({ name: 'is_ncert', default: false })
  isNcert: boolean;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @ManyToOne(() => Chapter, { nullable: true })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @Column({ name: 'chapter_id', nullable: true })
  chapterId: string;

  @ManyToOne(() => Topic, { nullable: true })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ name: 'topic_id', nullable: true })
  topicId: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];
}
