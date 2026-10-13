import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { Env } from '../../config/env.schema';
import { GenerationFailedError } from '../errors';
import type { CardGenerator, GenerationRequest, NewDeck } from '../interfaces';
import { toStatementDeckDraft, toTextDeckDraft } from '../mappers/llm-deck.mapper';
import { llmStatementDeckSchema, llmTextDeckSchema } from './llm-schemas/llm-deck.schema';
import { buildDeckPrompt, type DeckPrompt } from './prompts/deck.prompt';

const GEMINI_TIMEOUT_MS = 60_000;
const GEMINI_RETRY_OPTIONS = { attempts: 3, initialDelay: 1, maxDelay: 8, httpStatusCodes: [408, 500, 502, 503, 504] };
const GEMINI_TEMPERATURE = 0.7;
const SCHEMA_ATTEMPTS = 2;
const JSON_MIME_TYPE = 'application/json';

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

@Injectable()
export class GeminiCardGenerator implements CardGenerator {
  private readonly logger = new Logger(GeminiCardGenerator.name);
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(config: ConfigService<Env, true>) {
    this.client = new GoogleGenAI({
      apiKey: config.get('GEMINI_API_KEY', { infer: true }),
      httpOptions: { timeout: GEMINI_TIMEOUT_MS, retryOptions: GEMINI_RETRY_OPTIONS },
    });
    this.model = config.get('GEMINI_MODEL', { infer: true });
  }

  async generate(request: GenerationRequest): Promise<NewDeck> {
    const prompt = buildDeckPrompt(request);

    if (request.mode === 'truefalse') {
      return toStatementDeckDraft(request, await this.complete(prompt, llmStatementDeckSchema));
    }

    return toTextDeckDraft(request, request.mode, await this.complete(prompt, llmTextDeckSchema));
  }

  private async complete<T>(prompt: DeckPrompt, schema: z.ZodType<T>): Promise<T> {
    for (let attempt = 1; attempt <= SCHEMA_ATTEMPTS; attempt += 1) {
      const result = schema.safeParse(parseJson(await this.request(prompt, schema)));
      if (result.success) {
        return result.data;
      }
      this.logger.warn(`Gemini reply failed the schema, attempt ${attempt}: ${z.prettifyError(result.error)}`);
    }
    throw new GenerationFailedError('The model returned an invalid reply');
  }

  private async request(prompt: DeckPrompt, schema: z.ZodType): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt.userMessage,
        config: {
          systemInstruction: prompt.systemInstruction,
          responseMimeType: JSON_MIME_TYPE,
          responseJsonSchema: z.toJSONSchema(schema),
          temperature: GEMINI_TEMPERATURE,
        },
      });
      return response.text ?? '';
    } catch (error) {
      this.logger.error(`Gemini request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new GenerationFailedError('The model is unavailable');
    }
  }
}
