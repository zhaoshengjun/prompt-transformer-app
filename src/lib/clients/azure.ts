import {
  AIClient,
  AIResponse,
  TextGenerationOptions,
  ImageGenerationOptions,
  AIClientError,
  CanGenerateText,
  CanGenerateImage,
} from "./base";
import type {Model} from "../models";
import {AzureOpenAI} from "openai";
// OpenAI client implementation with singleton pattern
export class AzureOpenAIClient
  extends AIClient
  implements CanGenerateText, CanGenerateImage
{
  static instance: AzureOpenAIClient;
  private client: AzureOpenAI;

  private constructor(protected model: Model) {
    super(model, "azure-openai");
    // Initialize Azure OpenAI client here if needed
    this.client = new AzureOpenAI({
      apiKey: model.apiToken,
      endpoint: model.apiUrl,
      apiVersion: model.apiVersion,
      deployment: model.deployment,
    });
  }

  // Singleton pattern - one instance per unique configuration
  public static getInstance(model: Model): AzureOpenAIClient {
    if (!this.instance) {
      this.instance = new AzureOpenAIClient(model);
    }
    return this.instance;
  }

  async generateText(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<AIResponse<string>> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model.name,
        messages: [
          ...(options.systemPrompt
            ? [{role: "system" as const, content: options.systemPrompt}]
            : []),
          {role: "user", content: prompt},
        ],
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
      });
      // Process the response and return the desired format
      return {
        success: true,
        data: response.choices[0]?.message?.content || "",
      };
    } catch (error) {
      throw new AIClientError(
        `Azure OpenAI text generation failed: ${error}`,
        "azure-openai",
        error
      );
    }
  }

  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<AIResponse<string>> {
    try {
      const response = await this.client.images.generate({
        model: options.model || this.model.name || "dall-e-3",
        prompt: prompt,
        size: (options.size || "1024x1024") as
          | "1024x1024"
          | "1792x1024"
          | "1024x1792",
        quality: (options.quality || "standard") as "standard" | "hd",
        style: (options.style || "natural") as "natural" | "vivid",
        n: options.n || 1,
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL returned from Azure OpenAI");
      }

      return {
        success: true,
        data: imageUrl,
        metadata: {
          model: options.model || this.model.name || "dall-e-3",
        },
      };
    } catch (error) {
      throw new AIClientError(
        `Azure OpenAI image generation failed: ${error}`,
        "azure-openai",
        error
      );
    }
  }
}
