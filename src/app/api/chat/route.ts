import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { ChatRequest, ChatResponse } from '@/lib/types/api'

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await request.json()

    const { prompt, systemInstructions, model, parameters } = body

    // Validate required fields
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    if (!model) {
      return NextResponse.json({
        success: false,
        error: 'Model is required'
      }, { status: 400 })
    }

    // Generate enhanced prompt using AI service
    const enhancedResult = await aiService.generateEnhancedPrompt(
      model,
      prompt,
      {
        useCase: parameters.useCase,
        tone: parameters.tone,
        lighting: parameters.lighting,
        composition: parameters.composition,
        colorTheme: parameters.colorTheme,
        imageStyle: parameters.imageStyle,
        aspectRatio: parameters.aspectRatio
      }
    )

    if (!enhancedResult.success) {
      return NextResponse.json({
        success: false,
        error: enhancedResult.error || 'Failed to generate enhanced prompt'
      }, { status: 500 })
    }

    // Create the JSON output structure
    const jsonOutput = {
      prompt: enhancedResult.data || prompt, // Use enhanced prompt if available, fallback to original
      system_instructions: systemInstructions,
      model: model,
      parameters: {
        use_case: parameters.useCase,
        tone: parameters.tone,
        lighting: parameters.lighting,
        composition: parameters.composition,
        color_theme: parameters.colorTheme,
        color_grade: parameters.colorGrade,
        image_style: parameters.imageStyle,
        effects: parameters.effects,
        aspect_ratio: parameters.aspectRatio,
      },
      metadata: {
        created_at: new Date().toISOString(),
        version: "1.0",
      },
    }

    return NextResponse.json({
      success: true,
      data: jsonOutput
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}