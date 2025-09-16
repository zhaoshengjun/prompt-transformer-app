import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { ImageGenerationRequest, ImageGenerationResponse } from '@/lib/types/api'

export async function POST(request: NextRequest): Promise<NextResponse<ImageGenerationResponse>> {
  try {
    const body: ImageGenerationRequest = await request.json()

    const { prompt, model, parameters = {} } = body

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

    // Map aspect ratio to size if needed
    let size = parameters.size
    if (!size && parameters.aspectRatio) {
      switch (parameters.aspectRatio) {
        case '1:1':
          size = '1024x1024'
          break
        case '16:9':
          size = '1792x1024'
          break
        case '9:16':
          size = '1024x1792'
          break
        case '4:3':
          size = '1024x768'
          break
        case '3:2':
          size = '1024x683'
          break
        default:
          size = '1024x1024'
      }
    }

    // Prepare image generation options
    const imageOptions = {
      size: size || '1024x1024',
      quality: parameters.quality || 'standard',
      style: parameters.imageStyle || 'natural',
      n: parameters.n || 1
    }

    // Generate image using AI service
    const result = await aiService.generateImage(model, prompt, imageOptions)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate image'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.data || '',
        metadata: {
          model: model,
          prompt: prompt,
          duration: result.metadata?.duration,
          tokensUsed: result.metadata?.tokensUsed
        }
      }
    })

  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}