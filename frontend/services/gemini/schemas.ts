import { Type } from "@google/genai";
import {
  AnalysisType,
  Difficulty,
  Effort,
  MaturityLevel,
  Priority
} from '../../types';

// Schemas for JSON response
export const improvementSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    priority: { type: Type.STRING, enum: Object.values(Priority) },
    difficulty: { type: Type.STRING, enum: Object.values(Difficulty) },
    businessImpact: { type: Type.STRING },
  },
  required: ['title', 'description', 'priority', 'difficulty', 'businessImpact'],
};

export const nextStepSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: Object.values(Difficulty) },
  },
  required: ['title', 'description', 'difficulty'],
};

export const projectAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING },
    analysisType: { type: Type.STRING, enum: Object.values(AnalysisType) },
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: improvementSchema },
    nextSteps: {
      type: Type.OBJECT,
      properties: {
        shortTerm: { type: Type.ARRAY, items: nextStepSchema },
        longTerm: { type: Type.ARRAY, items: nextStepSchema },
      },
      required: ['shortTerm', 'longTerm'],
    },
    viability: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: 'An integer score from 1 to 10.' },
        assessment: { type: Type.STRING },
      },
      required: ['score', 'assessment'],
    },
    roiAnalysis: {
      type: Type.OBJECT,
      properties: {
        assessment: { type: Type.STRING },
        potentialGains: { type: Type.ARRAY, items: { type: Type.STRING } },
        estimatedEffort: { type: Type.STRING, enum: Object.values(Effort) },
      },
      required: ['assessment', 'potentialGains', 'estimatedEffort'],
    },
    maturity: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, enum: Object.values(MaturityLevel) },
        assessment: { type: Type.STRING },
      },
      required: ['level', 'assessment'],
    },
  },
  required: ['projectName', 'analysisType', 'summary', 'strengths', 'improvements', 'nextSteps', 'viability', 'roiAnalysis', 'maturity'],
};

export const evolutionAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING },
    analysisType: { type: Type.STRING, enum: Object.values(AnalysisType) },
    evolutionSummary: { type: Type.STRING },
    keyMetrics: {
      type: Type.OBJECT,
      properties: {
        previousScore: { type: Type.INTEGER },
        currentScore: { type: Type.INTEGER },
        scoreChange: { type: Type.NUMBER },
        previousStrengths: { type: Type.INTEGER },
        currentStrengths: { type: Type.INTEGER },
        previousImprovements: { type: Type.INTEGER },
        currentImprovements: { type: Type.INTEGER },
      },
      required: ['previousScore', 'currentScore', 'scoreChange', 'previousStrengths', 'currentStrengths', 'previousImprovements', 'currentImprovements'],
    },
    resolvedImprovements: { type: Type.ARRAY, items: improvementSchema },
    newImprovements: { type: Type.ARRAY, items: improvementSchema },
    persistentImprovements: { type: Type.ARRAY, items: improvementSchema },
  },
  required: ['projectName', 'analysisType', 'evolutionSummary', 'keyMetrics', 'resolvedImprovements', 'newImprovements', 'persistentImprovements'],
};

export const suggestedQuestionsSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 3 to 4 suggested questions a user might ask about the project analysis."
    }
  },
  required: ['questions']
};

export const dashboardInsightSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A friendly and encouraging title addressing the user, like 'Great progress on Kortex!'"
    },
    summary: {
      type: Type.STRING,
      description: "A short, insightful summary (2-3 sentences) about the user's recent activity, pointing out a trend or a positive development. It should end with a gentle, forward-looking suggestion."
    }
  },
  required: ['title', 'summary']
};
