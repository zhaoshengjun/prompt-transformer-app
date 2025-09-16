import {
  AIClient,
  ClientType,
  AIClientNotFoundError,
  AIClientConfigError,
} from "./base";
import {AzureOpenAIClient} from "./azure";
import {getPrivateModelConfig} from "../models";
import type {Model} from "../models";

// Singleton client manager that handles all AI client instances
export class ClientManager {
  private static instance: ClientManager;
  private clients: Map<string, AIClient> = new Map();

  private constructor() {}

  // Singleton pattern for the manager itself
  public static getInstance(): ClientManager {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager();
    }
    return ClientManager.instance;
  }

  // Get or create a client for a specific model
  public async getClient(modelId: string): Promise<AIClient> {
    // Check if client already exists
    if (this.clients.has(modelId)) {
      return this.clients.get(modelId)!;
    }

    // Get model configuration with private data
    const model = getPrivateModelConfig(modelId);
    if (!model) {
      throw new AIClientNotFoundError("unknown");
    }

    // Validate model configuration
    this.validateModelConfig(model);

    // Create client based on client type
    const client = await this.createClient(model);

    // Cache the client
    this.clients.set(modelId, client);

    return client;
  }

  // Create a new client instance based on model configuration
  private async createClient(model: Model): Promise<AIClient> {
    const clientType = this.determineClientType(model);

    switch (clientType) {
      case "azure-openai":
        return AzureOpenAIClient.getInstance(model);

      default:
        throw new AIClientNotFoundError(clientType);
    }
  }

  // Determine client type from model configuration
  private determineClientType(model: Model): ClientType {
    // If model has explicit clientType, use it
    if ("clientType" in model && model.clientType) {
      return model.clientType as ClientType;
    }

    // Auto-detect client type based on API URL and model ID
    const apiUrl = model.apiUrl?.toLowerCase() || "";
    const modelId = model.id.toLowerCase();

    // OpenAI detection
    if (
      apiUrl.includes("api.openai.com") ||
      modelId.includes("gpt") ||
      modelId.includes("dall-e")
    ) {
      return "openai";
    }

    // Azure OpenAI detection
    if (apiUrl.includes("openai.azure.com") || apiUrl.includes(".azure.")) {
      return "azure-openai";
    }

    // Anthropic detection
    if (apiUrl.includes("api.anthropic.com") || modelId.includes("claude")) {
      return "anthropic";
    }

    // Stability AI detection
    if (
      apiUrl.includes("api.stability.ai") ||
      modelId.includes("stable-diffusion")
    ) {
      return "stability";
    }

    // Midjourney detection
    if (apiUrl.includes("midjourney") || modelId.includes("midjourney")) {
      return "midjourney";
    }

    // Adobe detection
    if (apiUrl.includes("adobe") || modelId.includes("firefly")) {
      return "adobe";
    }

    // Default to OpenAI for unknown models
    console.warn(
      `Could not determine client type for model ${model.id}, defaulting to OpenAI`
    );
    return "openai";
  }

  // Validate model configuration
  private validateModelConfig(model: Model): void {
    if (!model.apiUrl) {
      throw new AIClientConfigError("unknown", "Missing apiUrl");
    }

    if (!model.apiToken) {
      throw new AIClientConfigError("unknown", "Missing apiToken");
    }

    // Additional validation based on client type
    const clientType = this.determineClientType(model);

    switch (clientType) {
      case "anthropic":
        if (!model.headers?.["anthropic-version"]) {
          console.warn(
            `Anthropic model ${model.id} missing anthropic-version header`
          );
        }
        break;

      case "azure-openai":
        if (!model.headers?.["api-version"]) {
          console.warn(
            `Azure OpenAI model ${model.id} missing api-version header`
          );
        }
        break;
    }
  }

  // Clear a specific client (useful when model config changes)
  public clearClient(modelId: string): void {
    this.clients.delete(modelId);
  }

  // Clear all clients (useful for testing or full reset)
  public clearAllClients(): void {
    this.clients.clear();
  }

  // Get list of active clients
  public getActiveClients(): string[] {
    return Array.from(this.clients.keys());
  }
}

// Export singleton instance for easy access
export const clientManager = ClientManager.getInstance();
