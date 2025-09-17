import {useState} from "react";
import {ImageGenerationRequest} from "@/lib/types/api";
import {toast} from "sonner";

export function useGenerateImage() {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");

  const generateImage = async (generatedJSON: string, imageModel: string) => {
    if (!generatedJSON) {
      toast("Error", {
        description: "Please generate JSON first.",
      });
      return false;
    }

    setIsGeneratingImage(true);

    try {
      // Parse the JSON to get the prompt
      const jsonData = JSON.parse(generatedJSON);
      const prompt = jsonData.prompt;

      const requestBody: ImageGenerationRequest = {
        prompt: prompt,
        model: imageModel,
        parameters: {
          aspectRatio: jsonData.parameters?.aspect_ratio,
          imageStyle: jsonData.parameters?.image_style,
          quality: "standard",
        },
      };

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate image");
      }

      setGeneratedImage(result.data.imageUrl);

      toast("Success", {
        description: "Image generated successfully!",
      });

      return true;
    } catch (error) {
      console.error("Error generating image:", error);
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to generate image",
      });
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const clearImage = () => {
    setGeneratedImage("");
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast("Downloaded", {
      description: "Image downloaded successfully!",
    });
  };

  const copyImageUrl = () => {
    if (!generatedImage) return;

    navigator.clipboard.writeText(generatedImage);
    toast("Copied", {
      description: "Image URL copied to clipboard!",
    });
  };

  return {
    isGeneratingImage,
    generatedImage,
    generateImage,
    clearImage,
    downloadImage,
    copyImageUrl,
  };
}
