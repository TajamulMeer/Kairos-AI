import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question, DifficultyLevel } from '../../database/entities/question.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

export interface QuestionFilter {
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  examTypeId?: string;
  isNcert?: boolean;
  isPyq?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
  ) {}

  async findAll(filter: QuestionFilter) {
    const { page = 1, limit = 20, search, ...where } = filter;
    const qb = this.questionRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.subject', 'subject')
      .leftJoinAndSelect('q.chapter', 'chapter')
      .leftJoinAndSelect('q.topic', 'topic')
      .where('q.isActive = :active', { active: true });

    if (where.subjectId) qb.andWhere('q.subjectId = :subjectId', { subjectId: where.subjectId });
    if (where.chapterId) qb.andWhere('q.chapterId = :chapterId', { chapterId: where.chapterId });
    if (where.topicId) qb.andWhere('q.topicId = :topicId', { topicId: where.topicId });
    if (where.difficulty) qb.andWhere('q.difficulty = :difficulty', { difficulty: where.difficulty });
    if (where.isNcert !== undefined) qb.andWhere('q.isNcert = :isNcert', { isNcert: where.isNcert });
    if (where.isPyq !== undefined) qb.andWhere('q.isPyq = :isPyq', { isPyq: where.isPyq });
    if (search) qb.andWhere('q.content ILIKE :search', { search: `%${search}%` });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const q = await this.questionRepo.findOne({ where: { id, isActive: true }, relations: ['subject', 'chapter', 'topic'] });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  async getAdaptiveQuestions(userId: string, subjectId?: string, count = 20) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const accuracy = profile?.overallAccuracy || 50;

    let difficulties: DifficultyLevel[];
    if (accuracy < 40) difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM];
    else if (accuracy < 65) difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.MEDIUM];
    else if (accuracy < 80) difficulties = [DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
    else difficulties = [DifficultyLevel.MEDIUM, DifficultyLevel.HARD, DifficultyLevel.HARD];

    const qb = this.questionRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.subject', 'subject')
      .leftJoinAndSelect('q.chapter', 'chapter')
      .where('q.isActive = :active', { active: true })
      .andWhere('q.difficulty IN (:...difficulties)', { difficulties })
      .orderBy('RANDOM()');

    if (subjectId) qb.andWhere('q.subjectId = :subjectId', { subjectId });
    return qb.take(count).getMany();
  }

  async getPracticeSet(subjectId: string, chapterId?: string, count = 30) {
    const qb = this.questionRepo.createQueryBuilder('q')
      .where('q.isActive = :active', { active: true })
      .andWhere('q.subjectId = :subjectId', { subjectId })
      .orderBy('q.neetWeightage', 'DESC')
      .addOrderBy('RANDOM()');

    if (chapterId) qb.andWhere('q.chapterId = :chapterId', { chapterId });
    return qb.take(count).getMany();
  }
}
