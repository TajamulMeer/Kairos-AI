import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TestsService } from './tests.service';
import { TestType } from '../../database/entities/test.entity';

@ApiTags('tests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Get() findAll(@Query('examTypeId') examTypeId?: string, @Query('type') type?: TestType) {
    return this.testsService.findAll(examTypeId, type);
  }

  @Get('my-attempts') getMyAttempts(@Request() req: any, @Query('testId') testId?: string) {
    return this.testsService.getUserAttempts(req.user.id, testId);
  }

  @Post('generate/full-length')
  generateFullLength(@Body('examTypeId') examTypeId: string, @Request() req: any) {
    return this.testsService.generateFullLengthTest(examTypeId, req.user.id);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.testsService.findOne(id); }

  @Post(':id/attempt/start')
  startAttempt(@Param('id') id: string, @Request() req: any) {
    return this.testsService.startAttempt(id, req.user.id);
  }

  @Post(':id/attempt/:attemptId/submit')
  @HttpCode(HttpStatus.OK)
  submitAttempt(@Param('id') id: string, @Param('attemptId') attemptId: string, @Request() req: any, @Body() body: any) {
    return this.testsService.submitAttempt(id, attemptId, req.user.id, body.responses, body.timeTakenSeconds);
  }

  @Get(':id/attempt/:attemptId')
  getAttempt(@Param('attemptId') attemptId: string, @Request() req: any) {
    return this.testsService.getAttempt(attemptId, req.user.id);
  }
}
