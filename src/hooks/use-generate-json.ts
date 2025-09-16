import {useState} from "react";
import {useToast} from "@/hooks/use-toast";
import {PromptConfig, ChatRequest} from "@/lib/types/api";

// TODO: could create a useAsync hook to save repeating this logic (also in useGenerateImage)
export function useGenerateJSON() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJSON, setGeneratedJSON] = useState<string>("");
  const {toast} = useToast();

  const generateJSON = async (config: PromptConfig, chatModel: string) => {
    if (!config.prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first.",
        variant: "destructive",
      });
      return false;
    }

    setIsGenerating(true);

    try {
      const requestBody: ChatRequest = {
        prompt: config.prompt,
        systemInstructions: config.systemInstructions,
        model: chatModel,
        parameters: {
          useCase: config.useCase,
          tone: config.tone,
          lighting: config.lighting,
          composition: config.composition,
          colorTheme: config.colorTheme,
          colorGrade: config.colorGrade,
          imageStyle: config.imageStyle,
          effects: config.effects,
          aspectRatio: config.aspectRatio,
        },
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate JSON");
      }

      setGeneratedJSON(JSON.stringify(result.data, null, 2));

      toast({
        title: "Success",
        description: "JSON prompt generated successfully!",
      });

      return true;
    } catch (error) {
      console.error("Error generating JSON:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate JSON",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearJSON = () => {
    setGeneratedJSON("");
  };

  return {
    isGenerating,
    generatedJSON,
    generateJSON,
    clearJSON,
  };
}
