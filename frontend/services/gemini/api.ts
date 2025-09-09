import { GoogleGenAI } from "@google/genai";
import { AnalysisType, EvolutionAnalysis, HistoryItem, ProjectAnalysis } from "../../types";
import { getAnalysisPrompt, getEvolutionPrompt } from "./prompts";
import { evolutionAnalysisSchema, projectAnalysisSchema } from "./schemas";
import { handleGeminiError, parseJsonResponse } from "./utils";

/**
 * Analyzes a project context using the Gemini API.
 * @param projectContext The context of the project to analyze.
 * @param analysisType The type of analysis to perform.
 * @param locale The desired language for the response.
 * @param apiKey The user's Gemini API key.
 * @returns A promise that resolves to the project analysis.
 */
export const analyzeProject = async (
  projectContext: string,
  analysisType: AnalysisType,
  locale: 'pt-BR' | 'en-US',
  apiKey: string,
): Promise<ProjectAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = getAnalysisPrompt(projectContext, analysisType, locale);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectAnalysisSchema,
      },
    });

    const usageMetadata = response.usageMetadata;
    const analysisResult = parseJsonResponse<ProjectAnalysis>(response.text || '{}', 'ProjectAnalysis');

    // Add usage metadata to the result
    if (usageMetadata) {
      analysisResult.usageMetadata = {
        promptTokenCount: usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: usageMetadata.totalTokenCount || 0,
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
 * @param apiKey The user's Gemini API key.
 * @returns A promise that resolves to the evolution analysis.
 */
export const compareAnalyses = async (
  item1: HistoryItem,
  item2: HistoryItem,
  locale: 'pt-BR' | 'en-US',
  apiKey: string,
): Promise<EvolutionAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = getEvolutionPrompt(item1, item2, locale);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evolutionAnalysisSchema,
      },
    });

    const usageMetadata = response.usageMetadata;
    const evolutionResult = parseJsonResponse<EvolutionAnalysis>(response.text || '{}', 'EvolutionAnalysis');

    if (usageMetadata) {
      evolutionResult.usageMetadata = {
        promptTokenCount: usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: usageMetadata.totalTokenCount || 0,
      };
    }

    return evolutionResult;

  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};
