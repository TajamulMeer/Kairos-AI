import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Injectable()
export class LeaderboardService {
  constructor(@InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>) {}

  getNational(limit = 50) {
    return this.profileRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .select(['p.userId', 'p.totalXp', 'p.overallAccuracy', 'p.currentStreak', 'u.fullName', 'u.avatarUrl', 'u.state'])
      .orderBy('p.totalXp', 'DESC').take(limit).getMany();
  }

  getStateLeaderboard(state: string, limit = 50) {
    return this.profileRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .select(['p.userId', 'p.totalXp', 'p.overallAccuracy', 'u.fullName', 'u.avatarUrl', 'u.state'])
      .where('u.state = :state', { state }).orderBy('p.totalXp', 'DESC').take(limit).getMany();
  }

  async getUserRank(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return null;
    const rank = await this.profileRepo.createQueryBuilder('p').where('p.totalXp > :xp', { xp: profile.totalXp }).getCount();
    const total = await this.profileRepo.count();
    return { rank: rank + 1, totalXp: profile.totalXp, percentile: +(100 - (rank / total * 100)).toFixed(1) };
  }
}
