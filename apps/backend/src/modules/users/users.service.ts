import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getStudentProfile(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    await this.userRepo.update(userId, updates);
    return this.getProfile(userId);
  }

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>) {
    await this.profileRepo.update({ userId }, updates);
    return this.getStudentProfile(userId);
  }

  async addFcmToken(userId: string, token: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const tokens = new Set(user?.fcmTokens || []);
    tokens.add(token);
    await this.userRepo.update(userId, { fcmTokens: Array.from(tokens) });
  }
}
