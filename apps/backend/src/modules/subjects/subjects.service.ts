import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../database/entities/subject.entity';
import { Chapter } from '../../database/entities/chapter.entity';
import { Topic } from '../../database/entities/topic.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    @InjectRepository(Chapter) private chapterRepo: Repository<Chapter>,
    @InjectRepository(Topic) private topicRepo: Repository<Topic>,
  ) {}

  getSubjects(examTypeId?: string) {
    return this.subjectRepo.find({ where: examTypeId ? { examTypeId, isActive: true } : { isActive: true }, order: { displayOrder: 'ASC' } });
  }
  getChapters(subjectId: string) {
    return this.chapterRepo.find({ where: { subjectId, isActive: true }, order: { displayOrder: 'ASC' } });
  }
  getTopics(chapterId: string) {
    return this.topicRepo.find({ where: { chapterId, isActive: true }, order: { displayOrder: 'ASC' } });
  }
}
