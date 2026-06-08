import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProviderService } from '../providers/ai-provider.service';
import { StudentProfile } from '../../../database/entities/student-profile.entity';
import { TestAttempt } from '../../../database/entities/test-attempt.entity';

@Injectable()
export class RankPredictorService {
  constructor(
    private aiProvider: AiProviderService,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
  ) {}

  async predictRank(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const recentAttempts = await this.attemptRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    if (recentAttempts.length === 0) {
      return { predictedScore: null, predictedRank: null, selectionProbability: 0, message: 'Complete at least one mock test for rank prediction.' };
    }

    const avgScore = recentAttempts.reduce((s, a) => s + Number(a.score), 0) / recentAttempts.length;
    const avgAccuracy = recentAttempts.reduce((s, a) => s + Number(a.accuracy), 0) / recentAttempts.length;
    const trend = recentAttempts.length > 1
      ? Number(recentAttempts[0].score) - Number(recentAttempts[recentAttempts.length - 1].score)
      : 0;

    // NEET 2024 cutoff reference: ~720 max, ~550+ for top colleges
    const predictedScore = Math.min(720, Math.round(avgScore * (720 / (recentAttempts[0].maxScore || 720))));
    const predictedRank = this.scoreToRank(predictedScore);
    const selectionProbability = predictedScore >= 550 ? 85 : predictedScore >= 450 ? 50 : predictedScore >= 350 ? 20 : 5;

    await this.profileRepo.update(userId, { predictedScore, predictedRank });

    const prompt = `NEET student performance data:
- Average Score: ${avgScore.toFixed(1)} marks
- Average Accuracy: ${avgAccuracy.toFixed(1)}%
- Score Trend: ${trend > 0 ? '+' + trend : trend} points over last ${recentAttempts.length} tests
- Predicted Score: ${predictedScore}/720
- Estimated Rank: ~${predictedRank.toLocaleString()}
- Selection Probability: ${selectionProbability}%

Write a 3-sentence motivational rank prediction message for this NEET student. Be encouraging but realistic.`;

    const result = await this.aiProvider.complete({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 200,
      temperature: 0.7,
    });

    return {
      predictedScore,
      predictedRank,
      selectionProbability,
      trend,
      message: result.content,
      basedOnTests: recentAttempts.length,
    };
  }

  private scoreToRank(score: number): number {
    // Approximate NEET rank distribution
    if (score >= 700) return Math.round((720 - score) * 50 + 1);
    if (score >= 650) return Math.round((700 - score) * 200 + 2500);
    if (score >= 600) return Math.round((650 - score) * 500 + 12500);
    if (score >= 550) return Math.round((600 - score) * 1000 + 37500);
    if (score >= 450) return Math.round((550 - score) * 2000 + 87500);
    return Math.round((450 - score) * 3000 + 287500);
  }
}
