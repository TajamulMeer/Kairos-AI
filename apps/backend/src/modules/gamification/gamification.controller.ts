import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('profile') getProfile(@Request() req: any) { return this.gamificationService.getProfile(req.user.id); }
  @Get('achievements') getAchievements(@Request() req: any) { return this.gamificationService.getAchievements(req.user.id); }
}
