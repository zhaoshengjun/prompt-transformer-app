// Types for model configuration
export interface Model {
  // Public fields (safe for client-side)
  id: string;
  name: string;
  groups: string[];
  description?: string;
  capabilities?: string[];

  // Private fields (server-side only, will be stripped for client)
  clientType?:
    | "openai"
    | "azure-openai"
    | "anthropic"
    | "stability"
    | "midjourney"
    | "adobe";
  apiUrl?: string;
  apiToken?: string;
  headers?: Record<string, string>;
  apiVersion?: string;
  deployment?: string;
  endpoints?: {
    chat?: string;
    image?: string;
    video?: string;
  };
}

// Public model interface (stripped of private fields)
export interface PublicModel {
  id: string;
  name: string;
  groups: string[];
  description?: string;
  capabilities?: string[];
}

export interface ModelsConfig {
  models: Model[];
}

export type ModelGroup = "chat" | "image" | "video";

/**
 * Parse and validate models configuration from environment variable
 */
function parseModelsConfig(): ModelsConfig {
  try {
    const configString = process.env.MODELS_CONFIG;

    if (!configString) {
      return {models: []};
    }

    const parsed = JSON.parse(configString) as ModelsConfig;

    // Validate the parsed configuration
    if (!parsed.models || !Array.isArray(parsed.models)) {
      throw new Error("Invalid models configuration: models array is required");
    }

    // Validate each model
    for (const model of parsed.models) {
      // Validate required public fields
      if (
        !model.id ||
        !model.name ||
        !model.groups ||
        !Array.isArray(model.groups)
      ) {
        throw new Error(
          `Invalid model configuration - missing required fields: ${JSON.stringify(
            model
          )}`
        );
      }

      // Validate private fields if present
      if (model.apiUrl && typeof model.apiUrl !== "string") {
        throw new Error(`Invalid apiUrl for model ${model.id}`);
      }

      if (model.apiToken && typeof model.apiToken !== "string") {
        throw new Error(`Invalid apiToken for model ${model.id}`);
      }

      if (model.headers && typeof model.headers !== "object") {
        throw new Error(`Invalid headers for model ${model.id}`);
      }

      if (model.endpoints && typeof model.endpoints !== "object") {
        throw new Error(`Invalid endpoints for model ${model.id}`);
      }
    }

    return parsed;
  } catch (error) {
    console.error("Error parsing models configuration:", error);
    console.warn("Falling back to default models");
    return {models: []};
  }
}

// Load models configuration
const modelsConfig = parseModelsConfig();

/**
 * Strip private fields from a model to create a public-safe version
 */
function stripPrivateFields(model: Model): PublicModel {
  const {clientType: _, apiUrl: __, apiToken: ___, headers: ____, endpoints: _____, ...publicFields} =
    model;
  return publicFields;
}

/**
 * Get all available models (public fields only for client-side safety)
 */
export function getAllModels(): PublicModel[] {
  return modelsConfig.models.map(stripPrivateFields);
}

/**
 * Get all models with private fields (server-side only)
 */
export function getAllModelsWithPrivateData(): Model[] {
  return modelsConfig.models;
}

/**
 * Get models filtered by group(s) (public fields only)
 */
export function getModelsByGroup(groups: string | string[]): PublicModel[] {
  const targetGroups = Array.isArray(groups) ? groups : [groups];

  return modelsConfig.models
    .filter((model) =>
      targetGroups.some((group) => model.groups.includes(group))
    )
    .map(stripPrivateFields);
}

/**
 * Get models filtered by group(s) with private data (server-side only)
 */
export function getModelsByGroupWithPrivateData(
  groups: string | string[]
): Model[] {
  const targetGroups = Array.isArray(groups) ? groups : [groups];

  return modelsConfig.models.filter((model) =>
    targetGroups.some((group) => model.groups.includes(group))
  );
}

/**
 * Get a specific model by ID (public fields only)
 */
export function getModelById(id: string): PublicModel | undefined {
  const model = modelsConfig.models.find((model) => model.id === id);
  return model ? stripPrivateFields(model) : undefined;
}

/**
 * Get a specific model by ID with private data (server-side only)
 */
export function getPrivateModelConfig(id: string): Model | undefined {
  return modelsConfig.models.find((model) => model.id === id);
}

/**
 * Get available groups from all models
 */
export function getAvailableGroups(): string[] {
  const groups = new Set<string>();
  modelsConfig.models.forEach((model) => {
    model.groups.forEach((group) => groups.add(group));
  });
  return Array.from(groups).sort();
}

/**
 * Validate if a model ID exists
 */
export function isValidModelId(id: string): boolean {
  return modelsConfig.models.some((model) => model.id === id);
}

/**
 * Get the first available model for a group (useful for defaults)
 */
export function getDefaultModelForGroup(
  group: string
): PublicModel | undefined {
  return getModelsByGroup(group)[0];
}
