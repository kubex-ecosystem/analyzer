import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AnalysisType, ProjectAnalysis, EvolutionAnalysis, HistoryItem } from "../../types";
import { getAnalysisPrompt, getEvolutionPrompt } from "./prompts";
import { projectAnalysisSchema, evolutionAnalysisSchema } from "./schemas";
import { parseJsonResponse, handleGeminiError } from "./utils";

const getApiKey = (userApiKey?: string): string => {
    const key = userApiKey || process.env.API_KEY;
    if (!key) {
        throw new Error("Gemini API key not found. Please provide it in the settings or set the API_KEY environment variable.");
    }
    return key;
}

/**
 * Tests a Gemini API key by making a lightweight request.
 * @param apiKey The API key to test.
 * @throws An error with a descriptive message if the key is invalid or another issue occurs.
 */
export const testApiKey = async (apiKey: string): Promise<void> => {
    if (!apiKey || !apiKey.trim()) {
      // Use a specific error message that can be caught and translated
      const err = new Error("API_KEY_EMPTY");
      err.name = 'ApiKeyError';
      throw err;
    }
    try {
      const ai = new GoogleGenAI({ apiKey });
      // Use a minimal, low-token request to validate the key and its permissions
      await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "test",
      });
    } catch (error) {
      // Let handleGeminiError parse the error and throw a more user-friendly message
      handleGeminiError(error);
    }
};


/**
 * Analyzes a project context using the Gemini API.
 * @param projectContext The context of the project to analyze.
 * @param analysisType The type of analysis to perform.
 * @param locale The desired language for the response.
 * @param userApiKey Optional user-provided API key.
 * @returns A promise that resolves to the project analysis.
 */
export const analyzeProject = async (
  projectContext: string,
  analysisType: AnalysisType,
  locale: 'pt-BR' | 'en-US',
  userApiKey?: string,
): Promise<ProjectAnalysis> => {
  try {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const prompt = getAnalysisPrompt(projectContext, analysisType, locale);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: projectAnalysisSchema,
        },
    });

    const usageMetadata = response.usageMetadata;
    const analysisResult = parseJsonResponse<ProjectAnalysis>(response.text, 'ProjectAnalysis');
    
    // Add usage metadata to the result
    if (usageMetadata) {
        analysisResult.usageMetadata = {
            promptTokenCount: usageMetadata.promptTokenCount,
            candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
            totalTokenCount: usageMetadata.totalTokenCount,
        };
    }

    return analysisResult;
  } catch (error) {
    handleGeminiError(error);
    // handleGeminiError throws, so this is for type safety.
    throw error;
  }
};

/**
 * Compares two history items to generate an evolution analysis using the Gemini API.
 * @param item1 The first history item.
 * @param item2 The second history item.
 * @param locale The desired language for the response.
 * @param userApiKey Optional user-provided API key.
 * @returns A promise that resolves to the evolution analysis.
 */
export const compareAnalyses = async (
  item1: HistoryItem,
  item2: HistoryItem,
  locale: 'pt-BR' | 'en-US',
  userApiKey?: string,
): Promise<EvolutionAnalysis> => {
  try {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const prompt = getEvolutionPrompt(item1, item2, locale);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: evolutionAnalysisSchema,
        },
    });
    
    const usageMetadata = response.usageMetadata;
    const evolutionResult = parseJsonResponse<EvolutionAnalysis>(response.text, 'EvolutionAnalysis');
    
    if (usageMetadata) {
        evolutionResult.usageMetadata = {
            promptTokenCount: usageMetadata.promptTokenCount,
            candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
            totalTokenCount: usageMetadata.totalTokenCount,
        };
    }
    
    return evolutionResult;

  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};

/**
 * Creates a new chat session with the Gemini API.
 * @param systemInstruction The system instruction/context for the chat.
 * @param userApiKey Optional user-provided API key.
 * @returns A Chat instance.
 */
export const createChatSession = (
  systemInstruction: string,
  userApiKey?: string,
): Chat => {
  const apiKey = getApiKey(userApiKey);
  const ai = new GoogleGenAI({ apiKey });
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
  return chat;
};