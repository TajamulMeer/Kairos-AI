import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiCompletionOptions, AiCompletionResult } from './ai-provider.service';

@Injectable()
export class GoogleAiProvider {
  private client: GoogleGenerativeAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.ai.googleAiApiKey');
    if (apiKey) this.client = new GoogleGenerativeAI(apiKey);
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.client) throw new Error('Google AI not configured');
    const model = options.model || 'gemini-1.5-pro';
    const genModel = this.client.getGenerativeModel({ model });
    const prompt = options.messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const result = await genModel.generateContent(prompt);
    return {
      content: result.response.text(),
      provider: 'google',
      model,
      tokensUsed: 0,
    };
  }
}
