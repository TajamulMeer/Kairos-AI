import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('performance') getPerformance(@Request() req: any) { return this.analyticsService.getPerformanceOverview(req.user.id); }
  @Get('subjects') getSubjects(@Request() req: any) { return this.analyticsService.getSubjectAnalysis(req.user.id); }
  @Get('heatmap') getHeatmap(@Request() req: any, @Query('weeks') weeks = 12) { return this.analyticsService.getWeeklyHeatmap(req.user.id, +weeks); }
  @Get('forecast') getForecast(@Request() req: any) { return this.analyticsService.getForecast(req.user.id); }
}
