import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StudyPlan, PlanStatus } from '../../database/entities/study-plan.entity';
import { StudySession, SessionType } from '../../database/entities/study-session.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';
import { startOfDay, endOfDay, subDays, addDays, format } from 'date-fns';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectRepository(StudyPlan) private planRepo: Repository<StudyPlan>,
    @InjectRepository(StudySession) private sessionRepo: Repository<StudySession>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
  ) {}

  getActivePlan(userId: string) {
    return this.planRepo.findOne({ where: { userId, status: PlanStatus.ACTIVE }, order: { createdAt: 'DESC' } });
  }

  async createPlan(userId: string, data: Partial<StudyPlan>) {
    await this.planRepo.update({ userId, status: PlanStatus.ACTIVE }, { status: PlanStatus.PAUSED });
    return this.planRepo.save(this.planRepo.create({ ...data, userId, status: PlanStatus.ACTIVE }));
  }

  async startSession(userId: string, type: SessionType, subjectId?: string, chapterId?: string) {
    return this.sessionRepo.save(this.sessionRepo.create({ userId, type, subjectId, chapterId, startedAt: new Date() }));
  }

  async endSession(sessionId: string, userId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Session not found');
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 60000);
    const xpEarned = Math.min(durationMinutes * 2, 200);
    await this.sessionRepo.save({ ...session, endedAt, durationMinutes, xpEarned });
    await this.profileRepo.createQueryBuilder().update()
      .set({ totalStudyHours: () => `"total_study_hours" + ${durationMinutes / 60}`, totalXp: () => `"total_xp" + ${xpEarned}` })
      .where('userId = :userId', { userId }).execute();
    return { durationMinutes, xpEarned };
  }

  getTodaySessions(userId: string) {
    const today = new Date();
    return this.sessionRepo.find({
      where: { userId, startedAt: Between(startOfDay(today), endOfDay(today)) },
      order: { startedAt: 'ASC' },
    });
  }

  async getStudyStats(userId: string, days = 7) {
    const from = subDays(new Date(), days);
    const sessions = await this.sessionRepo.find({
      where: { userId, startedAt: Between(startOfDay(from), endOfDay(new Date())) },
    });
    const dailyStats: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      dailyStats[format(addDays(from, i + 1), 'yyyy-MM-dd')] = 0;
    }
    sessions.forEach(s => {
      const d = format(s.startedAt, 'yyyy-MM-dd');
      if (dailyStats[d] !== undefined) dailyStats[d] += s.durationMinutes || 0;
    });
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    return { dailyStats, totalMinutes, totalHours: (totalMinutes / 60).toFixed(1), avgDailyMinutes: Math.round(totalMinutes / days) };
  }
}
