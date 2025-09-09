
import { 
    AnalysisType, 
    HistoryItem,
    Priority,
    MaturityLevel
// FIX: Corrected import path for types to point to the index file inside the types directory.
} from '../../types';

export const getAnalysisPrompt = (projectContext: string, analysisType: AnalysisType, locale: 'pt-BR' | 'en-US'): string => {
    const language = locale === 'pt-BR' ? 'Portuguese (Brazil)' : 'English (US)';
    const typeDescriptions: Record<AnalysisType, string> = {
        [AnalysisType.General]: "a comprehensive overview, including strengths, weaknesses, viability, and potential ROI.",
        [AnalysisType.Security]: "potential security vulnerabilities, risks, and best practices for mitigation.",
        [AnalysisType.Scalability]: "bottlenecks, architecture limitations, and strategies for improving scalability and performance under load.",
        [AnalysisType.CodeQuality]: "code structure, maintainability, adherence to best practices, and suggestions for refactoring.",
    };
    const analysisFocus = typeDescriptions[analysisType];

    return `
      You are a world-class senior software architect and project management consultant. Your task is to analyze a software project based on the provided context.
      The user has requested a "${analysisType}" analysis, which should focus on ${analysisFocus}.

      The response language MUST be ${language}.
      
      **Crucial Instruction**: For any fields that expect an enum value (like 'priority', 'difficulty', 'estimatedEffort', 'level'), you MUST use one of the following exact string values. Do not translate these values, even if the response language is not English.
      - Priority/Difficulty/Effort values: ${Object.values(Priority).join(', ')}
      - Maturity Level values: ${Object.values(MaturityLevel).join(', ')}

      Project Context:
      \`\`\`
      ${projectContext}
      \`\`\`

      Analyze the project context thoroughly and provide a detailed, insightful, and actionable report.
      - **Summary**: A concise executive summary of your findings.
      - **Strengths**: A list of key positive aspects.
      - **Improvements**: A prioritized list of areas for improvement. For each, provide a clear title, description, priority, difficulty, and its business impact.
      - **Next Steps**: Concrete short-term and long-term actions.
      - **Viability**: An overall viability score from 1 (very low) to 10 (excellent) and a justification.
      - **ROI Analysis**: An assessment of the a potential return on investment for implementing the suggested improvements, including potential gains and estimated effort.
      - **Maturity Level**: Assess the project's current maturity based on the context. The level must be one of the specified enum values. Provide a brief justification in the assessment.

      Your response MUST be a valid JSON object that strictly adheres to the provided schema. Do not include any text, notes, or explanations outside of the JSON structure.
    `;
};

export const getEvolutionPrompt = (item1: HistoryItem, item2: HistoryItem, locale: 'pt-BR' | 'en-US'): string => {
    const language = locale === 'pt-BR' ? 'Portuguese (Brazil)' : 'English (US)';
    const [older, newer] = [item1, item2].sort((a, b) => a.id - b.id);

    return `
      You are a senior project analyst. Your task is to compare two analyses of the same project, conducted at different times, and generate an evolution report.
      The response language MUST be ${language}.
      
      **Crucial Instruction**: For any fields named 'priority' or 'difficulty' in the generated lists (resolved, new, persistent improvements), you MUST use one of the following exact string values: ${Object.values(Priority).join(', ')}. Do not translate these values.

      The project is "${newer.projectName}" and the analysis type is "${newer.analysisType}".

      **Analysis 1 (Older - from ${older.timestamp}):**
      \`\`\`json
      ${JSON.stringify(older.analysis, null, 2)}
      \`\`\`

      **Analysis 2 (Newer - from ${newer.timestamp}):**
      \`\`\`json
      ${JSON.stringify(newer.analysis, null, 2)}
      \`\`\`

      Based on these two analyses, provide a detailed evolution report.
      - **evolutionSummary**: A summary describing the project's evolution, highlighting key changes, progress, and new challenges.
      - **keyMetrics**: Calculate the changes in key metrics: viability score, number of strengths, and number of improvements.
      - **resolvedImprovements**: Identify improvements from the older analysis that are no longer present in the newer one. Assume they have been resolved.
      - **newImprovements**: Identify improvements present in the newer analysis that were not in the older one.
      - **persistentImprovements**: Identify improvements that are present in both analyses.

      Your response MUST be a valid JSON object that strictly adheres to the provided schema. Do not include any text, notes, or explanations outside of the JSON structure.
    `;
};