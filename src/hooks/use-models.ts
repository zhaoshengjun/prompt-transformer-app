"use client";

import {PublicModel} from "@/lib/types/api";
import {useEffect, useState} from "react";

interface UseModelsReturn {
  allModels: PublicModel[];
  isLoading: boolean;
  error: string | null;
}

// Simple global state
let globalModels: PublicModel[] = [];
let globalLoading = false;
let globalError: string | null = null;
let fetchPromise: Promise<void> | null = null;

// Listeners for state changes
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

async function fetchModels(): Promise<void> {
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      globalLoading = true;
      globalError = null;
      notifyListeners();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      if (!baseUrl) {
        throw new Error(
          "Missing NEXT_PUBLIC_API_BASE_URL environment variable. Please set it in your .env.local file."
        );
      }
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/model`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      globalModels = data.models || [];
      globalError = null;
    } catch (err) {
      globalError =
        err instanceof Error ? err.message : "Failed to load models";
      globalModels = [];
    } finally {
      globalLoading = false;
      notifyListeners();
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Hook for managing models in components
 */
export function useModels(): UseModelsReturn {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);

    // Fetch models if not already loaded or loading
    if (globalModels.length === 0 && !globalLoading && !fetchPromise) {
      fetchModels();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    allModels: globalModels,
    isLoading: globalLoading,
    error: globalError,
  };
}

/**
 * Hook specifically for chat models (used in JSON generation)
 */
export function useChatModels() {
  const {allModels, isLoading, error} = useModels();
  return {
    allModels: allModels.filter((model) => model.groups.includes("chat")),
    isLoading,
    error,
  };
}

/**
 * Hook specifically for image models (used in image generation)
 */
export function useImageModels() {
  const {allModels, isLoading, error} = useModels();
  return {
    allModels: allModels.filter((model) => model.groups.includes("image")),
    isLoading,
    error,
  };
}

/**
 * Hook specifically for video models
 */
export function useVideoModels() {
  const {allModels, isLoading, error} = useModels();
  return {
    allModels: allModels.filter((model) => model.groups.includes("video")),
    isLoading,
    error,
  };
}
