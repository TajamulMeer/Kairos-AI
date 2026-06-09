import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlashcardsService } from './flashcards.service';

@ApiTags('flashcards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('flashcards')
export class FlashcardsController {
  constructor(private flashcardsService: FlashcardsService) {}

  @Get() findAll(@Query('chapterId') chapterId?: string, @Query('topicId') topicId?: string, @Query('isNcert') isNcert?: boolean) {
    return this.flashcardsService.findAll(chapterId, topicId, isNcert);
  }
  @Post() create(@Body() body: any, @Request() req: any) { return this.flashcardsService.create({ ...body, createdById: req.user.id }); }
}
