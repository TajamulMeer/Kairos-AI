import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

// Placeholder - Firebase verification handled directly in AuthService
@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: true, secretOrKey: 'firebase' });
  }
  async validate(payload: any) { return payload; }
}
