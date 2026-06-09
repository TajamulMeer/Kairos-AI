import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, TestType, TestStatus } from '../../database/entities/test.entity';
import { TestAttempt, AttemptStatus } from '../../database/entities/test-attempt.entity';
import { Question } from '../../database/entities/question.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
  ) {}

  findAll(examTypeId?: string, type?: TestType) {
    const qb = this.testRepo.createQueryBuilder('t')
      .where('t.status = :status', { status: TestStatus.ACTIVE })
      .andWhere('t.isPublic = true');
    if (examTypeId) qb.andWhere('t.examTypeId = :examTypeId', { examTypeId });
    if (type) qb.andWhere('t.type = :type', { type });
    return qb.orderBy('t.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const test = await this.testRepo.findOne({ where: { id }, relations: ['examType'] });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async generateFullLengthTest(examTypeId: string, userId: string) {
    const configs = [
      { code: 'BIOLOGY', count: 90 },
      { code: 'PHYSICS', count: 45 },
      { code: 'CHEMISTRY', count: 45 },
    ];

    const allIds: string[] = [];
    for (const cfg of configs) {
      const qs = await this.questionRepo.createQueryBuilder('q')
        .innerJoin('q.subject', 's')
        .where('s.code = :code', { code: cfg.code })
        .andWhere('q.examTypeId = :examTypeId', { examTypeId })
        .andWhere('q.isActive = true')
        .orderBy('RANDOM()')
        .take(cfg.count)
        .getMany();
      allIds.push(...qs.map(q => q.id));
    }

    const test = this.testRepo.create({
      title: `NEET Full Mock — ${new Date().toLocaleDateString('en-IN')}`,
      type: TestType.FULL_LENGTH,
      status: TestStatus.ACTIVE,
      durationMinutes: 200,
      totalQuestions: allIds.length,
      totalMarks: allIds.length * 4,
      marksPerCorrect: 4,
      negativeMarks: 1,
      questionIds: allIds,
      isPublic: false,
      createdById: userId,
      examTypeId,
    });
    return this.testRepo.save(test);
  }

  async startAttempt(testId: string, userId: string) {
    const test = await this.findOne(testId);
    const existing = await this.attemptRepo.findOne({ where: { testId, userId, status: AttemptStatus.IN_PROGRESS } });
    if (existing) {
      const questions = await this.questionRepo.findByIds(test.questionIds || []);
      return { attempt: existing, test, questions: questions.map(q => ({ ...q, correctOptionId: undefined })), resumed: true };
    }

    const attempt = await this.attemptRepo.save(this.attemptRepo.create({
      testId, userId, status: AttemptStatus.IN_PROGRESS, startedAt: new Date(), maxScore: test.totalMarks,
    }));
    const questions = await this.questionRepo.findByIds(test.questionIds || []);
    return { attempt, test, questions: questions.map(q => ({ ...q, correctOptionId: undefined })), resumed: false };
  }

  async submitAttempt(testId: string, attemptId: string, userId: string, responses: any[], timeTakenSeconds: number) {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId, testId, userId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status === AttemptStatus.COMPLETED) throw new BadRequestException('Already submitted');

    const test = await this.findOne(testId);
    const questions = await this.questionRepo.findByIds(responses.map(r => r.questionId));
    const qMap = new Map(questions.map(q => [q.id, q]));

    let score = 0, correct = 0, wrong = 0, skipped = 0;
    const subjectScores: Record<string, any> = {};

    const gradedResponses = responses.map(r => {
      const q = qMap.get(r.questionId);
      if (!q) return { ...r, isCorrect: false, marksEarned: 0 };
      const isCorrect = q.correctOptionId === r.selectedOptionId;
      const marksEarned = r.selectedOptionId ? (isCorrect ? +test.marksPerCorrect : -+test.negativeMarks) : 0;
      score += marksEarned;
      if (!r.selectedOptionId) skipped++;
      else if (isCorrect) correct++;
      else wrong++;

      const sid = q.subjectId;
      if (!subjectScores[sid]) subjectScores[sid] = { score: 0, correct: 0, wrong: 0, attempted: 0 };
      subjectScores[sid].score += marksEarned;
      if (r.selectedOptionId) {
        subjectScores[sid].attempted++;
        if (isCorrect) subjectScores[sid].correct++;
        else subjectScores[sid].wrong++;
      }
      return { ...r, isCorrect, marksEarned };
    });

    Object.keys(subjectScores).forEach(sid => {
      const s = subjectScores[sid];
      s.accuracy = s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0;
    });

    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    await this.attemptRepo.save({
      ...attempt, status: AttemptStatus.COMPLETED, completedAt: new Date(),
      timeTakenSeconds, score: Math.max(0, score), correctCount: correct, wrongCount: wrong,
      skippedCount: skipped, accuracy, responses: gradedResponses, subjectScores,
    });

    // Update profile stats
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (profile) {
      const newTotal = profile.totalQuestionsAttempted + (correct + wrong + skipped);
      const newCorrect = profile.totalQuestionsCorrect + correct;
      await this.profileRepo.update({ userId }, {
        totalQuestionsAttempted: newTotal,
        totalQuestionsCorrect: newCorrect,
        overallAccuracy: newTotal > 0 ? (newCorrect / newTotal) * 100 : 0,
      });
    }

    return this.attemptRepo.findOne({ where: { id: attemptId } });
  }

  getUserAttempts(userId: string, testId?: string) {
    const where: any = { userId };
    if (testId) where.testId = testId;
    return this.attemptRepo.find({ where, relations: ['test'], order: { createdAt: 'DESC' }, take: 20 });
  }

  async getAttempt(attemptId: string, userId: string) {
    const a = await this.attemptRepo.findOne({ where: { id: attemptId, userId }, relations: ['test'] });
    if (!a) throw new NotFoundException('Attempt not found');
    return a;
  }
}
