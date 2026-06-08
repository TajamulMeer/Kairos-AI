import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AiCompletionOptions, AiCompletionResult } from './ai-provider.service';

@Injectable()
export class AnthropicProvider {
  private client: Anthropic | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.ai.anthropicApiKey');
    if (apiKey) this.client = new Anthropic({ apiKey });
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.client) throw new Error('Anthropic not configured');
    const model = options.model || 'claude-opus-4-8';
    const systemMsg = options.messages.find(m => m.role === 'system')?.content;
    const userMessages = options.messages.filter(m => m.role !== 'system');
    const response = await this.client.messages.create({
      model,
      max_tokens: options.maxTokens || 2048,
      system: systemMsg,
      messages: userMessages as any,
    });
    return {
      content: (response.content[0] as any).text || '',
      provider: 'anthropic',
      model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }
}
