import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('subjects')
export class SubjectsController {
  constructor(private subjectsService: SubjectsService) {}

  @Get() getSubjects(@Query('examTypeId') examTypeId?: string) { return this.subjectsService.getSubjects(examTypeId); }
  @Get(':id/chapters') getChapters(@Param('id') id: string) { return this.subjectsService.getChapters(id); }
  @Get(':id/chapters/:chapterId/topics') getTopics(@Param('chapterId') chapterId: string) { return this.subjectsService.getTopics(chapterId); }
}
