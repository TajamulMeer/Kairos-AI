import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiCompletionOptions, AiCompletionResult } from './ai-provider.service';

@Injectable()
export class OpenAiProvider {
  private client: OpenAI | null = null;
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.ai.openaiApiKey');
    if (apiKey) this.client = new OpenAI({ apiKey });
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.client) throw new Error('OpenAI not configured');
    const model = options.model || 'gpt-4o';
    const response = await this.client.chat.completions.create({
      model,
      messages: options.messages as any,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
    });
    return {
      content: response.choices[0].message.content || '',
      provider: 'openai',
      model,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }
}
