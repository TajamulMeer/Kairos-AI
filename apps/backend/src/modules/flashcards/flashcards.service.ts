import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from '../../database/entities/flashcard.entity';

@Injectable()
export class FlashcardsService {
  constructor(@InjectRepository(Flashcard) private repo: Repository<Flashcard>) {}

  findAll(chapterId?: string, topicId?: string, isNcert?: boolean) {
    const where: any = { isPublic: true };
    if (chapterId) where.chapterId = chapterId;
    if (topicId) where.topicId = topicId;
    if (isNcert !== undefined) where.isNcert = isNcert;
    return this.repo.find({ where });
  }

  create(data: Partial<Flashcard>) { return this.repo.save(this.repo.create(data)); }
  createBulk(cards: Partial<Flashcard>[]) { return this.repo.save(cards.map(c => this.repo.create(c))); }
}
