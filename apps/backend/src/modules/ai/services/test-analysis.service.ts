import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProviderService } from '../providers/ai-provider.service';
import { TestAttempt } from '../../../database/entities/test-attempt.entity';
import { StudentProfile } from '../../../database/entities/student-profile.entity';

@Injectable()
export class TestAnalysisService {
  constructor(
    private aiProvider: AiProviderService,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
  ) {}

  async analyzeAttempt(attemptId: string, userId: string) {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId, userId }, relations: ['test'] });
    if (!attempt) return null;

    const profile = await this.profileRepo.findOne({ where: { userId } });

    const analysisData = {
      score: attempt.score,
      maxScore: attempt.maxScore,
      accuracy: attempt.accuracy,
      timeTaken: attempt.timeTakenSeconds,
      subjectScores: attempt.subjectScores,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      skippedCount: attempt.skippedCount,
    };

    const prompt = `Analyze this NEET test performance and provide actionable insights:

Test Results:
- Score: ${analysisData.score}/${analysisData.maxScore}
- Accuracy: ${analysisData.accuracy}%
- Time Taken: ${Math.round(analysisData.timeTaken / 60)} minutes
- Correct: ${analysisData.correctCount}, Wrong: ${analysisData.wrongCount}, Skipped: ${analysisData.skippedCount}
- Subject Scores: ${JSON.stringify(analysisData.subjectScores, null, 2)}

Overall Profile:
- Historical Accuracy: ${profile?.overallAccuracy || 0}%
- Weak Topics: ${profile?.weakTopics?.join(', ') || 'None identified'}

Provide:
1. Performance Summary (2-3 sentences)
2. Top 3 Weak Areas identified from this test
3. Top 3 Strong Areas
4. Time Management Analysis
5. Specific Improvement Actions (3 bullet points)
6. Predicted NEET score range based on this performance
7. Motivational closing message

Be specific, data-driven, and encouraging.`;

    const result = await this.aiProvider.complete({
      messages: [
        { role: 'system', content: 'You are an expert NEET performance analyst and mentor.' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 1000,
      temperature: 0.4,
    });

    // Update attempt with AI analysis
    await this.attemptRepo.update(attemptId, { aiAnalysis: { analysis: result.content, analyzedAt: new Date() } });

    return {
      analysis: result.content,
      score: attempt.score,
      maxScore: attempt.maxScore,
      accuracy: attempt.accuracy,
      subjectScores: attempt.subjectScores,
    };
  }
}
