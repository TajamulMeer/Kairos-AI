import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProviderService } from './providers/ai-provider.service';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GoogleAiProvider } from './providers/google-ai.provider';
import { DoubtSolverService } from './services/doubt-solver.service';
import { StudyPlanAiService } from './services/study-plan-ai.service';
import { TestAnalysisService } from './services/test-analysis.service';
import { MentorChatService } from './services/mentor-chat.service';
import { RankPredictorService } from './services/rank-predictor.service';
import { FlashcardGeneratorService } from './services/flashcard-generator.service';
import { User } from '../../database/entities/user.entity';
import { StudentProfile } from '../../database/entities/student-profile.entity';
import { TestAttempt } from '../../database/entities/test-attempt.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, StudentProfile, TestAttempt]),
    BullModule.registerQueue({ name: 'ai-jobs' }),
    StorageModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiProviderService,
    OpenAiProvider,
    AnthropicProvider,
    GoogleAiProvider,
    DoubtSolverService,
    StudyPlanAiService,
    TestAnalysisService,
    MentorChatService,
    RankPredictorService,
    FlashcardGeneratorService,
  ],
  exports: [AiService, AiProviderService],
})
export class AiModule {}
