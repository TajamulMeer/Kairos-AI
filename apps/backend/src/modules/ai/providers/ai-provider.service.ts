import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';
import { GoogleAiProvider } from './google-ai.provider';

export interface AiMessage { role: 'user' | 'assistant' | 'system'; content: string; }
export interface AiCompletionOptions {
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
}
export interface AiCompletionResult { content: string; provider: string; model: string; tokensUsed: number; }

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(
    private configService: ConfigService,
    private openai: OpenAiProvider,
    private anthropic: AnthropicProvider,
    private googleAi: GoogleAiProvider,
  ) {}

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const defaultProvider = this.configService.get<string>('app.ai.defaultProvider', 'openai');
    const fallbackProvider = this.configService.get<string>('app.ai.fallbackProvider', 'anthropic');
    const providerName = options.provider || defaultProvider;

    try {
      return await this.callProvider(providerName as any, options);
    } catch (err) {
      this.logger.warn(`Provider ${providerName} failed, falling back to ${fallbackProvider}: ${err.message}`);
      try {
        return await this.callProvider(fallbackProvider as any, options);
      } catch (fallbackErr) {
        this.logger.error(`Fallback provider also failed: ${fallbackErr.message}`);
        throw fallbackErr;
      }
    }
  }

  private async callProvider(
    provider: 'openai' | 'anthropic' | 'google',
    options: AiCompletionOptions,
  ): Promise<AiCompletionResult> {
    switch (provider) {
      case 'openai': return this.openai.complete(options);
      case 'anthropic': return this.anthropic.complete(options);
      case 'google': return this.googleAi.complete(options);
      default: return this.openai.complete(options);
    }
  }
}
