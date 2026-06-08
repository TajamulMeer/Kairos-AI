import { Injectable } from '@nestjs/common';
import { DoubtSolverService, DoubtSolveRequest } from './services/doubt-solver.service';
import { MentorChatService } from './services/mentor-chat.service';
import { TestAnalysisService } from './services/test-analysis.service';
import { RankPredictorService } from './services/rank-predictor.service';
import { FlashcardGeneratorService } from './services/flashcard-generator.service';
import { StudyPlanAiService } from './services/study-plan-ai.service';
import { AiMessage } from './providers/ai-provider.service';

@Injectable()
export class AiService {
  constructor(
    private doubtSolver: DoubtSolverService,
    private mentorChat: MentorChatService,
    private testAnalysis: TestAnalysisService,
    private rankPredictor: RankPredictorService,
    private flashcardGenerator: FlashcardGeneratorService,
    private studyPlanAi: StudyPlanAiService,
  ) {}

  solveDoubt(request: DoubtSolveRequest) { return this.doubtSolver.solveDoubt(request); }
  mentorChatMessage(userId: string, message: string, history: AiMessage[]) { return this.mentorChat.chat(userId, message, history); }
  analyzeTest(attemptId: string, userId: string) { return this.testAnalysis.analyzeAttempt(attemptId, userId); }
  predictRank(userId: string) { return this.rankPredictor.predictRank(userId); }
  generateFlashcards(topic: string, subject: string, count?: number) { return this.flashcardGenerator.generateFlashcards(topic, subject, count); }
  generateDailyPlan(userId: string) { return this.studyPlanAi.generateDailyPlan(userId); }
}
