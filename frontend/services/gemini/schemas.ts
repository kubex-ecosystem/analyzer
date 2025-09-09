
import { Type } from "@google/genai";
import { 
    AnalysisType,
    Priority,
    Difficulty,
    Effort,
    MaturityLevel
// FIX: Corrected import path for types to point to the index file inside the types directory.
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