import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';
import { User, UserRole, UserStatus, SubscriptionTier, ExamTarget, ClassYear } from '../../database/entities/user.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FirebaseAuthDto } from './dto/firebase-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.initFirebase();
  }

  private initFirebase() {
    if (!admin.apps.length) {
      const projectId = this.configService.get('app.firebase.projectId');
      if (projectId) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey: this.configService.get('app.firebase.privateKey'),
            clientEmail: this.configService.get('app.firebase.clientEmail'),
          }),
        });
      }
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      subscriptionTier: SubscriptionTier.FREE,
      examTarget: (dto.examTarget as ExamTarget) || ExamTarget.NEET,
      classYear: dto.classYear as ClassYear,
      targetYear: dto.targetYear,
      preferredLanguage: dto.preferredLanguage || 'en',
    });

    // Store hashed password in a separate approach via firebase or local
    // For local auth, we'd add a passwords table. Using a simple approach:
    (user as any).passwordHash = hashedPassword;
    const saved = await this.userRepo.save(user);

    // Create student profile
    await this.profileRepo.save(this.profileRepo.create({ userId: saved.id }));

    return this.generateTokenPair(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.BANNED) throw new UnauthorizedException('Account banned');

    // In production, password stored separately. Demo: check via bcrypt
    const isValid = await bcrypt.compare(dto.password, (user as any).passwordHash || '');
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    await this.userRepo.update(user.id, { lastActiveAt: new Date() });
    return this.generateTokenPair(user);
  }

  async firebaseAuth(dto: FirebaseAuthDto) {
    let firebaseUser: admin.auth.DecodedIdToken;
    try {
      firebaseUser = await admin.auth().verifyIdToken(dto.idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    let user = await this.userRepo.findOne({ where: { firebaseUid: firebaseUser.uid } });

    if (!user) {
      user = this.userRepo.create({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || dto.email,
        fullName: firebaseUser.name || dto.fullName || 'NEET Aspirant',
        avatarUrl: firebaseUser.picture,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        subscriptionTier: SubscriptionTier.FREE,
        examTarget: ExamTarget.NEET,
        isEmailVerified: firebaseUser.email_verified || false,
      });
      user = await this.userRepo.save(user);
      await this.profileRepo.save(this.profileRepo.create({ userId: user.id }));
    }

    await this.userRepo.update(user.id, { lastActiveAt: new Date() });
    return this.generateTokenPair(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.jwtRefreshSecret'),
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.generateTokenPair(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  private generateTokenPair(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwtRefreshSecret'),
      expiresIn: this.configService.get('app.jwtRefreshExpiresIn', '7d'),
    });
    return { user: this.sanitizeUser(user), accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { ...safe } = user;
    delete (safe as any).passwordHash;
    return safe;
  }
}
