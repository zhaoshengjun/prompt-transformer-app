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
        model_id: chatModel,
        text_prompt: config.prompt,
        extra_config: {
          system_prompt: config.systemInstructions,
        },
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // must be public for Next.js client usage
      if (!baseUrl) {
        throw new Error(
          "Missing NEXT_PUBLIC_API_BASE_URL environment variable. Please set it in your .env.local file."
        );
      }

      // Ensure no double slashes when concatenating
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/chat`;

      const response = await fetch(endpoint, {
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
