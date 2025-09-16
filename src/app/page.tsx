"use client";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {Textarea} from "@/components/ui/textarea";
import {useGenerateImage} from "@/hooks/use-generate-image";
import {useGenerateJSON} from "@/hooks/use-generate-json";
import {useChatModels, useImageModels} from "@/hooks/use-models";
import {useToast} from "@/hooks/use-toast";
import {PromptConfig} from "@/lib/types/api";
import {
  Camera,
  Copy,
  Download,
  Palette,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import {useState} from "react";

// Default config will be initialized with dynamic models
function createDefaultConfig(): PromptConfig {
  return {
    prompt: "",
    systemInstructions:
      "You are an AI assistant that creates detailed image generation prompts.",
    useCase: "general",
    tone: "professional",
    lighting: "natural",
    composition: "balanced",
    colorTheme: "vibrant",
    colorGrade: "standard",
    imageStyle: "photorealistic",
    effects: "none",
    aspectRatio: "16:9",
  };
}

export default function PromptTransformer() {
  const chatModels = useChatModels();
  const imageModels = useImageModels();
  const {toast} = useToast();
  const {
    isGenerating,
    generatedJSON,
    generateJSON: handleGenerateJSON,
  } = useGenerateJSON();
  const {
    isGeneratingImage,
    generatedImage,
    generateImage: handleGenerateImage,
    downloadImage,
    copyImageUrl,
  } = useGenerateImage();

  // Initialize default models

  const [config, setConfig] = useState<PromptConfig>(() =>
    createDefaultConfig()
  );
  const [selectedImageModel, setSelectedImageModel] = useState<string>("");
  const [selectedChatModel, setSelectedChatModel] = useState<string>("");

  const updateConfig = (key: keyof PromptConfig, value: string) => {
    setConfig((prev) => ({...prev, [key]: value}));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJSON);
    toast({
      title: "Copied",
      description: "JSON copied to clipboard!",
    });
  };

  const downloadJSON = () => {
    const blob = new Blob([generatedJSON], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "JSON file downloaded successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Prompt Transformer
          </h1>
          <p className="text-muted-foreground text-lg">
            Transform simple prompts into structured JSON configurations for AI
            image generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section - Takes 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Prompt Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">User Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your simple prompt here (e.g., 'A sunset over mountains')"
                    value={config.prompt}
                    onChange={(e) => updateConfig("prompt", e.target.value)}
                    className="min-h-[120px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="system">System Instructions</Label>
                  <Textarea
                    id="system"
                    placeholder="System instructions for the AI model"
                    value={config.systemInstructions}
                    onChange={(e) =>
                      updateConfig("systemInstructions", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={selectedChatModel}
                    onValueChange={(value) => setSelectedChatModel(value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={"Select a model"} />
                    </SelectTrigger>
                    <SelectContent>
                      {chatModels.allModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => handleGenerateJSON(config, selectedChatModel)}
                  disabled={
                    isGenerating || !config.prompt.trim()
                    // chatModels.isLoading ||
                    // !selectedChatModel
                  }
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate JSON
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Configuration Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Use Case</Label>
                    <Select
                      value={config.useCase}
                      onValueChange={(value) => updateConfig("useCase", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tone</Label>
                    <Select
                      value={config.tone}
                      onValueChange={(value) => updateConfig("tone", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Lighting</Label>
                    <Select
                      value={config.lighting}
                      onValueChange={(value) => updateConfig("lighting", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="harsh">Harsh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Composition</Label>
                    <Select
                      value={config.composition}
                      onValueChange={(value) =>
                        updateConfig("composition", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="rule-of-thirds">
                          Rule of Thirds
                        </SelectItem>
                        <SelectItem value="centered">Centered</SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color Theme</Label>
                    <Select
                      value={config.colorTheme}
                      onValueChange={(value) =>
                        updateConfig("colorTheme", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="muted">Muted</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color Grade</Label>
                    <Select
                      value={config.colorGrade}
                      onValueChange={(value) =>
                        updateConfig("colorGrade", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="high-contrast">
                          High Contrast
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Image Style</Label>
                    <Select
                      value={config.imageStyle}
                      onValueChange={(value) =>
                        updateConfig("imageStyle", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photorealistic">
                          Photorealistic
                        </SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Effects</Label>
                    <Select
                      value={config.effects}
                      onValueChange={(value) => updateConfig("effects", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="blur">Blur</SelectItem>
                        <SelectItem value="glow">Glow</SelectItem>
                        <SelectItem value="grain">Grain</SelectItem>
                        <SelectItem value="vignette">Vignette</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <Label>Aspect Ratio</Label>
                    <Select
                      value={config.aspectRatio}
                      onValueChange={(value) =>
                        updateConfig("aspectRatio", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Output */}
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generated JSON
                </div>
                {generatedJSON && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadJSON}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedJSON ? (
                <div className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-[400px] font-mono">
                      <code>{generatedJSON}</code>
                    </pre>
                    <Badge
                      className="absolute top-2 right-2"
                      variant="secondary"
                    >
                      JSON
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <Label>Image Generation Model</Label>
                      <Select
                        value={selectedImageModel}
                        onValueChange={setSelectedImageModel}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={"Select a model"} />
                        </SelectTrigger>
                        <SelectContent>
                          {imageModels.allModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* {imageModels.error && (
                        <p className="text-sm text-destructive mt-1">
                          {imageModels.error}
                        </p>
                      )} */}
                    </div>

                    <Button
                      onClick={() =>
                        handleGenerateImage(generatedJSON, selectedImageModel)
                      }
                      disabled={
                        !generatedJSON || isGeneratingImage
                        // imageModels.isLoading ||
                        // !selectedImageModel
                      }
                      className="w-full"
                      variant="secondary"
                    >
                      {isGeneratingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Generating Image...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-8 rounded-lg text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated JSON will appear here</p>
                  <p className="text-sm mt-2">
                    Enter a prompt and click "Generate JSON" to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Generation */}
          <Card className="border-2 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Image Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={generatedImage}
                      alt="Generated image"
                      className="w-full h-auto rounded-lg max-h-[400px] object-contain"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant="secondary"
                    >
                      Generated
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadImage}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyImageUrl}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-8 rounded-lg text-center text-muted-foreground min-h-[300px] flex flex-col items-center justify-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {generatedJSON
                      ? "Ready to Generate Image"
                      : "Generate JSON First"}
                  </p>
                  <p className="text-sm mt-2">
                    {generatedJSON
                      ? "Click 'Generate Image' to create your image"
                      : "Generated images will appear here"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
