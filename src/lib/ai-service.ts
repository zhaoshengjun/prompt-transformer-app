import {clientManager} from "./clients/manager";
import {
  AIResponse,
  TextGenerationOptions,
  ImageGenerationOptions,
  VideoGenerationOptions,
  CanGenerateImage,
  CanGenerateText,
  CanGenerateVideo,
} from "./clients/base";
import {getModelById} from "./models";

const supportTextGeneration = (client: unknown): client is CanGenerateText => {
  return client !== null && typeof client === "object" && "generateText" in client;
};
const supportImageGeneration = (client: unknown): client is CanGenerateImage => {
  return client !== null && typeof client === "object" && "generateImage" in client;
};
const supportVideoGeneration = (client: unknown): client is CanGenerateVideo => {
  return client !== null && typeof client === "object" && "generateVideo" in client;
};

// High-level AI service that provides a clean interface for the application
export class AIService {
  private static instance: AIService;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Generate text using a specific model
  async generateText(
    modelId: string,
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<AIResponse<string>> {
    try {
      // Validate model exists
      const model = getModelById(modelId);
      if (!model) {
        return {
          success: false,
          error: `Model ${modelId} not found`,
        };
      }

      // Check if model supports text generation
      if (!model.groups.some((group) => ["chat", "text"].includes(group))) {
        return {
          success: false,
          error: `Model ${modelId} does not support text generation`,
        };
      }

      // Get client and generate text
      const client = await clientManager.getClient(modelId);
      if (!supportTextGeneration(client)) {
        return {
          success: false,
          error: `Text generation not implemented for model ${modelId}`,
        };
      }
      return await client.generateText(prompt, options);
    } catch (error) {
      console.error(`Text generation failed for model ${modelId}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Generate image using a specific model
  async generateImage(
    modelId: string,
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<AIResponse<string>> {
    try {
      // Validate model exists
      const model = getModelById(modelId);
      if (!model) {
        return {
          success: false,
          error: `Model ${modelId} not found`,
        };
      }

      // Check if model supports image generation
      if (!model.groups.includes("image")) {
        return {
          success: false,
          error: `Model ${modelId} does not support image generation`,
        };
      }

      // Get client and generate image
      const client = await clientManager.getClient(modelId);
      if (supportImageGeneration(client)) {
        return await client.generateImage!(prompt, options);
      }
      if (!supportImageGeneration(client)) {
        return {
          success: false,
          error: `Image generation not implemented for model ${modelId}`,
        };
      }
      return await client.generateImage!(prompt, options);
    } catch (error) {
      console.error(`Image generation failed for model ${modelId}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Generate video using a specific model (optional, not all models support it)
  async generateVideo(
    modelId: string,
    prompt: string,
    options: VideoGenerationOptions = {}
  ): Promise<AIResponse<string>> {
    try {
      // Validate model exists
      const model = getModelById(modelId);
      if (!model) {
        return {
          success: false,
          error: `Model ${modelId} not found`,
        };
      }

      // Check if model supports video generation
      if (!model.groups.includes("video")) {
        return {
          success: false,
          error: `Model ${modelId} does not support video generation`,
        };
      }

      // Get client and generate video
      const client = await clientManager.getClient(modelId);

      if (!supportVideoGeneration(client)) {
        return {
          success: false,
          error: `Video generation not implemented for model ${modelId}`,
        };
      }

      return await client.generateVideo(prompt, options);
    } catch (error) {
      console.error(`Video generation failed for model ${modelId}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Enhanced JSON prompt generation with AI assistance
  async generateEnhancedPrompt(
    modelId: string,
    userPrompt: string,
    config: {
      useCase?: string;
      tone?: string;
      lighting?: string;
      composition?: string;
      colorTheme?: string;
      imageStyle?: string;
      aspectRatio?: string;
    }
  ): Promise<AIResponse<string>> {
    try {
      const enhancementPrompt = this.createEnhancementPrompt(
        userPrompt,
        config
      );

      return await this.generateText(modelId, enhancementPrompt, {
        systemPrompt: `You are an expert AI prompt engineer. Your task is to enhance user prompts for image generation by incorporating technical details, artistic elements, and professional terminology while maintaining the user's original intent.`,
        maxTokens: 500,
        temperature: 0.7,
      });
    } catch (error) {
      console.error(`Enhanced prompt generation failed:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to enhance prompt",
      };
    }
  }

  // Create enhancement prompt based on configuration
  private createEnhancementPrompt(userPrompt: string, config: {
    useCase?: string;
    tone?: string;
    lighting?: string;
    composition?: string;
    colorTheme?: string;
    imageStyle?: string;
    aspectRatio?: string;
  }): string {
    let enhancementPrompt = `Please enhance this image generation prompt: "${userPrompt}"\n\n`;
    enhancementPrompt += `Requirements:\n`;

    if (config.useCase) {
      enhancementPrompt += `- Use case: ${config.useCase}\n`;
    }
    if (config.tone) {
      enhancementPrompt += `- Tone: ${config.tone}\n`;
    }
    if (config.lighting) {
      enhancementPrompt += `- Lighting: ${config.lighting}\n`;
    }
    if (config.composition) {
      enhancementPrompt += `- Composition: ${config.composition}\n`;
    }
    if (config.colorTheme) {
      enhancementPrompt += `- Color theme: ${config.colorTheme}\n`;
    }
    if (config.imageStyle) {
      enhancementPrompt += `- Image style: ${config.imageStyle}\n`;
    }
    if (config.aspectRatio) {
      enhancementPrompt += `- Aspect ratio: ${config.aspectRatio}\n`;
    }

    enhancementPrompt += `\nReturn only the enhanced prompt, no explanations.`;

    return enhancementPrompt;
  }

  // Clear cached clients (useful when model configurations change)
  clearModelClient(modelId: string): void {
    clientManager.clearClient(modelId);
  }

  clearAllClients(): void {
    clientManager.clearAllClients();
  }
}

// Export singleton instance for easy access
export const aiService = AIService.getInstance();
