import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuestionsService } from './questions.service';
import { DifficultyLevel } from '../../database/entities/question.entity';

@ApiTags('questions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get questions with filters' })
  findAll(
    @Query('subjectId') subjectId?: string,
    @Query('chapterId') chapterId?: string,
    @Query('topicId') topicId?: string,
    @Query('difficulty') difficulty?: DifficultyLevel,
    @Query('isNcert') isNcert?: boolean,
    @Query('isPyq') isPyq?: boolean,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.questionsService.findAll({ subjectId, chapterId, topicId, difficulty, isNcert, isPyq, search, page: +page, limit: +limit });
  }

  @Get('adaptive')
  @ApiOperation({ summary: 'Get AI-adaptive questions' })
  getAdaptive(@Request() req: any, @Query('subjectId') subjectId?: string, @Query('count') count = 20) {
    return this.questionsService.getAdaptiveQuestions(req.user.id, subjectId, +count);
  }

  @Get('practice')
  @ApiOperation({ summary: 'Get practice questions' })
  getPractice(@Query('subjectId') subjectId: string, @Query('chapterId') chapterId?: string, @Query('count') count = 30) {
    return this.questionsService.getPracticeSet(subjectId, chapterId, +count);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single question' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }
}
