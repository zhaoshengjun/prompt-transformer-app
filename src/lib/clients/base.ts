// Base types for AI client system

import {Model} from "../models";

export type ClientType =
  | "openai"
  | "azure-openai"
  | "anthropic"
  | "stability"
  | "midjourney"
  | "adobe"
  | "unknown";

export interface TextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface ImageGenerationOptions {
  size?: string;
  quality?: string;
  style?: string;
  model?: string;
  n?: number;
}

export interface VideoGenerationOptions {
  duration?: number;
  aspectRatio?: string;
  fps?: number;
  model?: string;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    duration?: number;
  };
}

// Base AI client interface that all client implementations must follow
export abstract class AIClient {
  protected constructor(
    protected model: Model,
    protected clientType: ClientType
  ) {}
}

export interface CanGenerateText {
  generateText(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<AIResponse<string>>;
}

export interface CanGenerateImage {
  generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<AIResponse<string>>;
}

export interface CanGenerateVideo {
  generateVideo(
    prompt: string,
    options?: VideoGenerationOptions
  ): Promise<AIResponse<string>>;
}

// Error types for better error handling
export class AIClientError extends Error {
  constructor(
    message: string,
    public clientType: ClientType,
    public originalError?: any
  ) {
    super(message);
    this.name = "AIClientError";
  }
}

export class AIClientNotFoundError extends Error {
  constructor(clientType: ClientType) {
    super(`AI client not found for type: ${clientType}`);
    this.name = "AIClientNotFoundError";
  }
}

export class AIClientConfigError extends Error {
  constructor(clientType: ClientType, configIssue: string) {
    super(`Configuration error for ${clientType}: ${configIssue}`);
    this.name = "AIClientConfigError";
  }
}
