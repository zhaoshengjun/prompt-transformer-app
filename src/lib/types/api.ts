// API Types for the prompt transformer application

// Chat API Types
export interface ChatRequest {
  prompt: string
  systemInstructions: string
  model: string
  parameters: {
    useCase: string
    tone: string
    lighting: string
    composition: string
    colorTheme: string
    colorGrade: string
    imageStyle: string
    effects: string
    aspectRatio: string
  }
}

export interface ChatResponse {
  success: boolean
  data?: {
    prompt: string
    system_instructions: string
    model: string
    parameters: {
      use_case: string
      tone: string
      lighting: string
      composition: string
      color_theme: string
      color_grade: string
      image_style: string
      effects: string
      aspect_ratio: string
    }
    metadata: {
      created_at: string
      version: string
    }
  }
  error?: string
}

// Image Generation API Types
export interface ImageGenerationRequest {
  prompt: string
  model: string
  parameters?: {
    aspectRatio?: string
    imageStyle?: string
    quality?: string
    size?: string
    n?: number
  }
}

export interface ImageGenerationResponse {
  success: boolean
  data?: {
    imageUrl: string
    metadata?: {
      model: string
      prompt: string
      duration?: number
      tokensUsed?: number
    }
  }
  error?: string
}

// Frontend configuration interface
export interface PromptConfig {
  prompt: string
  systemInstructions: string
  useCase: string
  tone: string
  lighting: string
  composition: string
  colorTheme: string
  colorGrade: string
  imageStyle: string
  effects: string
  aspectRatio: string
}

// API Error interface
export interface APIError {
  success: false
  error: string
  status?: number
}