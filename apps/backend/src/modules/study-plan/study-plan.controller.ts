import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StudyPlanService } from './study-plan.service';
import { SessionType } from '../../database/entities/study-session.entity';

@ApiTags('study-plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('study-plans')
export class StudyPlanController {
  constructor(private studyPlanService: StudyPlanService) {}

  @Get('active') getActivePlan(@Request() req: any) { return this.studyPlanService.getActivePlan(req.user.id); }
  @Get('today') getTodaySessions(@Request() req: any) { return this.studyPlanService.getTodaySessions(req.user.id); }
  @Get('stats') getStats(@Request() req: any, @Query('days') days = 7) { return this.studyPlanService.getStudyStats(req.user.id, +days); }

  @Post('sessions/start')
  startSession(@Request() req: any, @Body() body: { type: SessionType; subjectId?: string; chapterId?: string }) {
    return this.studyPlanService.startSession(req.user.id, body.type, body.subjectId, body.chapterId);
  }

  @Post('sessions/:id/end')
  @HttpCode(HttpStatus.OK)
  endSession(@Param('id') id: string, @Request() req: any) {
    return this.studyPlanService.endSession(id, req.user.id);
  }
}
