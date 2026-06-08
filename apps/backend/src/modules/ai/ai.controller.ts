import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class DoubtSolveDto {
  @ApiProperty() @IsString() question: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() subject?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageBase64?: string;
}

class MentorChatDto {
  @ApiProperty() @IsString() message: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() conversationHistory?: any[];
}

class GenerateFlashcardsDto {
  @ApiProperty() @IsString() topic: string;
  @ApiProperty() @IsString() subject: string;
  @ApiProperty({ required: false }) @IsOptional() count?: number;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('doubt/solve')
  @ApiOperation({ summary: 'Solve a NEET doubt with AI' })
  solveDoubt(@Body() dto: DoubtSolveDto, @Request() req: any) {
    return this.aiService.solveDoubt({
      question: dto.question,
      subject: dto.subject,
      imageBase64: dto.imageBase64,
      studentContext: { classYear: req.user.classYear },
    });
  }

  @Post('mentor/chat')
  @ApiOperation({ summary: 'Chat with AI Mentor' })
  mentorChat(@Body() dto: MentorChatDto, @Request() req: any) {
    return this.aiService.mentorChatMessage(req.user.id, dto.message, dto.conversationHistory || []);
  }

  @Post('test/:attemptId/analyze')
  @ApiOperation({ summary: 'AI analysis of test attempt' })
  analyzeTest(@Param('attemptId') attemptId: string, @Request() req: any) {
    return this.aiService.analyzeTest(attemptId, req.user.id);
  }

  @Get('rank/predict')
  @ApiOperation({ summary: 'Predict NEET rank based on performance' })
  predictRank(@Request() req: any) {
    return this.aiService.predictRank(req.user.id);
  }

  @Post('flashcards/generate')
  @ApiOperation({ summary: 'AI-generate flashcards for a topic' })
  generateFlashcards(@Body() dto: GenerateFlashcardsDto) {
    return this.aiService.generateFlashcards(dto.topic, dto.subject, dto.count);
  }

  @Get('study-plan/today')
  @ApiOperation({ summary: 'Generate today AI study plan' })
  generateDailyPlan(@Request() req: any) {
    return this.aiService.generateDailyPlan(req.user.id);
  }
}
