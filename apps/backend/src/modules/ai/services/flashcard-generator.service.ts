import { Injectable } from '@nestjs/common';
import { AiProviderService } from '../providers/ai-provider.service';

@Injectable()
export class FlashcardGeneratorService {
  constructor(private aiProvider: AiProviderService) {}

  async generateFlashcards(topic: string, subject: string, count = 10) {
    const prompt = `Generate ${count} high-quality flashcards for NEET preparation.
Topic: ${topic}
Subject: ${subject}

Return a JSON array with this exact format (no markdown, just raw JSON):
[
  {
    "front": "Question or concept to remember",
    "back": "Answer or explanation (concise, under 100 words)",
    "tags": ["tag1", "tag2"]
  }
]

Focus on:
- NCERT-based facts
- Previous year NEET question patterns
- Frequently tested concepts
- Mnemonics where helpful`;

    const result = await this.aiProvider.complete({
      messages: [
        { role: 'system', content: 'You are a NEET flashcard creator. Return only valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 2000,
      temperature: 0.5,
    });

    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}

    return [];
  }
}
