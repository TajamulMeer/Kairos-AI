import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from '../../database/entities/student-profile.entity';

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3100, 4200, 5500, 7000];
const LEVEL_NAMES = ['Beginner', 'Learner', 'Practitioner', 'Scholar', 'Expert', 'Master', 'Champion', 'Elite', 'Legend', 'NEET Warrior', 'AIRIX Champion'];

const BADGES = [
  { id: 'streak_7', name: '7-Day Streak', icon: '🔥', condition: (p: StudentProfile) => p.currentStreak >= 7 },
  { id: 'streak_30', name: 'Monthly Streak', icon: '💫', condition: (p: StudentProfile) => p.currentStreak >= 30 },
  { id: 'accuracy_80', name: 'Sharp Shooter', icon: '🎯', condition: (p: StudentProfile) => +p.overallAccuracy >= 80 },
  { id: 'xp_1000', name: 'XP Milestone', icon: '⭐', condition: (p: StudentProfile) => p.totalXp >= 1000 },
  { id: 'questions_500', name: 'Question Master', icon: '📝', condition: (p: StudentProfile) => p.totalQuestionsAttempted >= 500 },
  { id: 'questions_1000', name: 'Question Legend', icon: '🏆', condition: (p: StudentProfile) => p.totalQuestionsAttempted >= 1000 },
];

@Injectable()
export class GamificationService {
  constructor(@InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>) {}

  async getProfile(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return null;
    const level = this.getLevel(profile.totalXp);
    const nextXp = XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)];
    const currXp = XP_THRESHOLDS[Math.max(0, level - 1)];
    return {
      totalXp: profile.totalXp, level,
      levelName: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
      levelProgress: nextXp > currXp ? Math.min(100, ((profile.totalXp - currXp) / (nextXp - currXp)) * 100) : 100,
      xpToNextLevel: Math.max(0, nextXp - profile.totalXp),
      currentStreak: profile.currentStreak, longestStreak: profile.longestStreak,
      badges: BADGES.filter(b => b.condition(profile)).map(({ condition, ...b }) => b),
    };
  }

  async getAchievements(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return [];
    return BADGES.map(({ condition, ...badge }) => ({ ...badge, earned: condition(profile) }));
  }

  async awardXp(userId: string, xp: number) {
    await this.profileRepo.createQueryBuilder().update()
      .set({ totalXp: () => `"total_xp" + ${xp}` })
      .where('userId = :userId', { userId }).execute();
    return { xpAwarded: xp };
  }

  private getLevel(xp: number) {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= XP_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  }
}
