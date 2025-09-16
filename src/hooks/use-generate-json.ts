import {useState} from "react";
import {PromptConfig, ChatRequest} from "@/lib/types/api";
import {toast} from "sonner";

// TODO: could create a useAsync hook to save repeating this logic (also in useGenerateImage)
export function useGenerateJSON() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJSON, setGeneratedJSON] = useState<string>("");
  const generateJSON = async (config: PromptConfig, chatModel: string) => {
    if (!config.prompt.trim()) {
      toast("Error", {
        description: "Please enter a prompt first.",
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

      toast("Success", {
        description: "JSON prompt generated successfully!",
      });

      return true;
    } catch (error) {
      console.error("Error generating JSON:", error);
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to generate JSON",
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
