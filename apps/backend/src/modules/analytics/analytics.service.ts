import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TestAttempt, AttemptStatus } from '../../database/entities/test-attempt.entity';
import { StudySession } from '../../database/entities/study-session.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';
import { subDays, startOfDay, endOfDay, format, addDays } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
    @InjectRepository(StudySession) private sessionRepo: Repository<StudySession>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
  ) {}

  async getPerformanceOverview(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const recentAttempts = await this.attemptRepo.find({
      where: { userId, status: AttemptStatus.COMPLETED },
      order: { completedAt: 'DESC' }, take: 10, relations: ['test'],
    });
    const scoreHistory = recentAttempts.reverse().map(a => ({
      date: format(a.completedAt || a.createdAt, 'MMM dd'),
      score: +a.score, accuracy: +a.accuracy,
    }));
    const avgScore = recentAttempts.length > 0 ? recentAttempts.reduce((s, a) => s + +a.score, 0) / recentAttempts.length : 0;
    const avgAccuracy = recentAttempts.length > 0 ? recentAttempts.reduce((s, a) => s + +a.accuracy, 0) / recentAttempts.length : 0;
    return { profile, scoreHistory, totalTests: recentAttempts.length, avgScore, avgAccuracy };
  }

  async getSubjectAnalysis(userId: string) {
    const attempts = await this.attemptRepo.find({
      where: { userId, status: AttemptStatus.COMPLETED },
      order: { completedAt: 'DESC' }, take: 20,
    });
    const subjectData: Record<string, { scores: number[]; accuracies: number[] }> = {};
    attempts.forEach(a => {
      if (!a.subjectScores) return;
      Object.entries(a.subjectScores).forEach(([sid, data]: [string, any]) => {
        if (!subjectData[sid]) subjectData[sid] = { scores: [], accuracies: [] };
        subjectData[sid].scores.push(data.score || 0);
        subjectData[sid].accuracies.push(data.accuracy || 0);
      });
    });
    return Object.entries(subjectData).map(([subjectId, d]) => ({
      subjectId,
      avgScore: d.scores.reduce((s, v) => s + v, 0) / (d.scores.length || 1),
      avgAccuracy: d.accuracies.reduce((s, v) => s + v, 0) / (d.accuracies.length || 1),
      attempts: d.scores.length,
    }));
  }

  async getWeeklyHeatmap(userId: string, weeks = 12) {
    const from = subDays(new Date(), weeks * 7);
    const sessions = await this.sessionRepo.find({
      where: { userId, startedAt: Between(startOfDay(from), endOfDay(new Date())) },
    });
    const heatmap: Record<string, number> = {};
    sessions.forEach(s => {
      const d = format(s.startedAt, 'yyyy-MM-dd');
      heatmap[d] = (heatmap[d] || 0) + (s.durationMinutes || 0);
    });
    return { heatmap, activeDays: Object.values(heatmap).filter(v => v > 0).length };
  }

  async getForecast(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const attempts = await this.attemptRepo.find({
      where: { userId, status: AttemptStatus.COMPLETED },
      order: { completedAt: 'ASC' }, take: 20,
    });
    if (attempts.length < 3) return { message: 'Complete more tests for forecast' };
    const scores = attempts.map(a => +a.score);
    const half = Math.floor(scores.length / 2);
    const trend = (scores.slice(half).reduce((s, v) => s + v, 0) / scores.slice(half).length) -
                  (scores.slice(0, half).reduce((s, v) => s + v, 0) / scores.slice(0, half).length);
    const last = scores[scores.length - 1];
    const projected = [1, 2, 3, 4].map(m => ({
      month: format(addDays(new Date(), m * 30), 'MMM yyyy'),
      score: Math.min(720, Math.round(last + trend * m * 2)),
    }));
    return { trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable', trendValue: trend, projected, currentScore: last, burnoutRisk: profile?.burnoutRiskScore || 0 };
  }
}
