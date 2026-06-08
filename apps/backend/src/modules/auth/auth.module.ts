import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { User } from '../../database/entities/user.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, StudentProfile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('app.jwtSecret'),
        signOptions: { expiresIn: config.get('app.jwtExpiresIn', '15m') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FirebaseStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
