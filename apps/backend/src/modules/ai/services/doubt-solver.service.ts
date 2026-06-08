import { Injectable } from '@nestjs/common';
import { AiProviderService } from '../providers/ai-provider.service';

export interface DoubtSolveRequest {
  question: string;
  subject?: string;
  imageBase64?: string;
  studentContext?: { weakTopics?: string[]; classYear?: string };
}

@Injectable()
export class DoubtSolverService {
  constructor(private aiProvider: AiProviderService) {}

  async solveDoubt(request: DoubtSolveRequest) {
    const systemPrompt = `You are an expert NEET tutor for Indian students.
You specialize in Physics, Chemistry, and Biology at the NEET level.
Provide step-by-step solutions with clear explanations.
Use simple language suitable for Class 11/12 Indian students.
Always mention the key concept being tested.
Format your response with: 1) Solution 2) Key Concept 3) Common Mistakes 4) Similar Question Tip`;

    const userPrompt = `Subject: ${request.subject || 'General'}
${request.studentContext?.classYear ? `Student: ${request.studentContext.classYear}` : ''}
${request.studentContext?.weakTopics?.length ? `Student's weak areas: ${request.studentContext.weakTopics.join(', ')}` : ''}

Question: ${request.question}`;

    const result = await this.aiProvider.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 1500,
      temperature: 0.3,
    });

    return {
      solution: result.content,
      provider: result.provider,
      relatedConcepts: this.extractConcepts(result.content),
    };
  }

  private extractConcepts(content: string): string[] {
    const lines = content.split('\n');
    const conceptLine = lines.find(l => l.toLowerCase().includes('key concept'));
    if (!conceptLine) return [];
    return [conceptLine.replace(/key concept[:\s]*/i, '').trim()];
  }
}
