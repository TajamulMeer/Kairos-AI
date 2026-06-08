import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProviderService, AiMessage } from '../providers/ai-provider.service';
import { StudentProfile } from '../../../database/entities/student-profile.entity';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class MentorChatService {
  constructor(
    private aiProvider: AiProviderService,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async chat(userId: string, message: string, conversationHistory: AiMessage[]) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const profile = await this.profileRepo.findOne({ where: { userId } });

    const systemPrompt = `You are an expert, empathetic AI NEET Mentor for Indian students.
You have detailed knowledge of the student you are talking to.

Student Profile:
- Name: ${user?.fullName}
- Class: ${user?.classYear || 'Unknown'}
- Target Year: ${user?.targetYear || 'This year'}
- Exam: NEET
- Current Accuracy: ${profile?.overallAccuracy || 0}%
- Study Streak: ${profile?.currentStreak || 0} days
- Total XP: ${profile?.totalXp || 0}
- Predicted Score: ${profile?.predictedScore || 'Not yet calculated'}
- Predicted Rank: ${profile?.predictedRank ? '#' + profile.predictedRank : 'Not yet calculated'}
- Weak Topics: ${profile?.weakTopics?.join(', ') || 'Not yet identified'}
- Strong Topics: ${profile?.strongTopics?.join(', ') || 'Not yet identified'}
- Motivation Level: ${profile?.motivationLevel || 5}/10

Your personality:
- Be warm, encouraging and supportive like a personal tutor
- Be specific and data-driven when giving advice
- Reference the student's actual performance data
- Motivate when they seem low
- Challenge them when they are performing well
- Always focus on NEET success
- Keep responses concise (under 200 words unless explaining a concept)
- End with an actionable suggestion or question

Respond in the student's preferred tone. Always be positive about their NEET journey.`;

    const messages: AiMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8),
      { role: 'user', content: message },
    ];

    const result = await this.aiProvider.complete({ messages, maxTokens: 512, temperature: 0.8 });

    const suggestions = this.generateSuggestions(message, profile);

    return { response: result.content, suggestions, provider: result.provider };
  }

  private generateSuggestions(lastMessage: string, profile: StudentProfile | null): string[] {
    const weak = profile?.weakTopics?.[0];
    const defaults = [
      "What should I focus on today?",
      "Give me a motivation boost!",
      "How is my progress?",
    ];
    if (weak) defaults.unshift(`Help me with ${weak}`);
    return defaults.slice(0, 3);
  }
}
