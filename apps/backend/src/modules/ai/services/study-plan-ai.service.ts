import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProviderService } from '../providers/ai-provider.service';
import { StudentProfile } from '../../../database/entities/student-profile.entity';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class StudyPlanAiService {
  constructor(
    private aiProvider: AiProviderService,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async generateDailyPlan(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const profile = await this.profileRepo.findOne({ where: { userId } });

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    const prompt = `Create a detailed daily NEET study plan for today (${today}).

Student Profile:
- Class: ${user?.classYear}
- Target Year: ${user?.targetYear}
- Available Hours: 8-10 hours
- Weak Topics: ${profile?.weakTopics?.join(', ') || 'Not identified yet'}
- Strong Topics: ${profile?.strongTopics?.join(', ') || 'Not identified yet'}
- Overall Accuracy: ${profile?.overallAccuracy || 0}%
- Current Streak: ${profile?.currentStreak || 0} days
- Burnout Risk: ${profile?.burnoutRiskScore || 0}/1

Return a JSON object with this exact structure:
{
  "title": "Today's Study Plan",
  "totalHours": 8,
  "aiReasoning": "Why I designed this plan (2 sentences)",
  "tasks": [
    {
      "id": "1",
      "title": "Task title",
      "subject": "Biology/Physics/Chemistry",
      "chapter": "Chapter name",
      "type": "study/revision/practice/test",
      "durationMinutes": 60,
      "priority": "high/medium/low",
      "color": "#4AE26B",
      "resources": ["NCERT Chapter X", "Previous Year Questions"]
    }
  ],
  "breaks": [
    { "afterTask": 2, "durationMinutes": 15, "type": "short" }
  ],
  "motivationalMessage": "Personalized message for today"
}`;

    const result = await this.aiProvider.complete({
      messages: [
        { role: 'system', content: 'You are a NEET study planner AI. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 1500,
      temperature: 0.6,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}

    return { title: 'Study Plan', tasks: [], aiReasoning: result.content };
  }
}
