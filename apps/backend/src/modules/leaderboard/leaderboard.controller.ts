import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get('national') getNational(@Query('limit') limit = 50) { return this.leaderboardService.getNational(+limit); }
  @Get('state') getState(@Query('state') state: string, @Query('limit') limit = 50) { return this.leaderboardService.getStateLeaderboard(state, +limit); }
  @Get('my-rank') getMyRank(@Request() req: any) { return this.leaderboardService.getUserRank(req.user.id); }
}
