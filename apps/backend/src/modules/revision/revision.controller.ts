import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RevisionService } from './revision.service';

@ApiTags('revision')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('revision')
export class RevisionController {
  constructor(private revisionService: RevisionService) {}

  @Get('due') getDue(@Request() req: any, @Query('limit') limit = 20) { return this.revisionService.getDueCards(req.user.id, +limit); }
  @Post('flashcards/:id/review') review(@Param('id') id: string, @Request() req: any, @Body('quality') quality: number) { return this.revisionService.reviewCard(req.user.id, id, quality); }
  @Post('flashcards/:id/enroll') enroll(@Param('id') id: string, @Request() req: any) { return this.revisionService.enrollFlashcard(req.user.id, id); }
}
