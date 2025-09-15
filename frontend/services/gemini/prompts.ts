import { 
    AnalysisType, 
    HistoryItem,
    Priority,
    MaturityLevel,
    Difficulty,
    Effort
} from '../../types';

export const getAnalysisPrompt = (projectContext: string, analysisType: AnalysisType, locale: 'pt-BR' | 'en-US'): string => {
    const language = locale === 'pt-BR' ? 'Portuguese (Brazil)' : 'English (US)';
    
    const typeSpecificInstructions: Record<AnalysisType, string> = {
        [AnalysisType.General]: "Provide a holistic overview. Assess the project's goals, current state, and future potential. Your evaluation should be balanced, covering technology, process, and business value.",
        [AnalysisType.Security]: "Adopt the mindset of a security engineer. Analyze the context for potential vulnerabilities based on OWASP Top 10 principles. Focus on authentication, data handling, dependencies, and infrastructure security. Suggestions must be concrete and actionable.",
        [AnalysisType.Scalability]: "Act as a performance and scalability expert. Identify potential bottlenecks in the architecture, data access patterns, and infrastructure. Consider caching strategies, database performance, load balancing, and asynchronous processing.",
        [AnalysisType.CodeQuality]: "Think like a lead developer focused on maintainability. Evaluate code structure, adherence to design patterns (like SOLID), complexity, and clarity. Suggest specific refactoring opportunities and best practices.",
    };

    const analysisFocus = typeSpecificInstructions[analysisType];

    return `
      You are a world-class senior software architect and project management consultant with 20 years of experience. Your task is to analyze a software project based on the provided context, following a structured, step-by-step thinking process.

      **Your Thought Process:**
      1.  **Deconstruct Context:** First, thoroughly read and understand all the provided project documentation. Identify the core technologies, goals, and current status of the project.
      2.  **Apply Specific Lens:** Based on the requested analysis type, apply the corresponding expert lens to the context.
      3.  **Formulate Insights:** Generate strengths, weaknesses, and actionable recommendations based on your expert evaluation.
      4.  **Structure Response:** Finally, construct the JSON response, ensuring every field is populated with insightful and relevant information, strictly adhering to the schema.

      **Requested Analysis Type:** "${analysisType}"
      **Your Focus for this Analysis:** ${analysisFocus}
      
      **Response Language:** The entire JSON response, including all string values, MUST be in ${language}.
      
      **Crucial Schema Instructions**: 
      For any fields that expect an enum value (like 'priority', 'difficulty', 'estimatedEffort', 'level'), you MUST use one of the following exact string values. These enum values are universal and MUST NOT be translated.
      - Priority values: ${Object.values(Priority).join(', ')}
      - Difficulty values: ${Object.values(Difficulty).join(', ')}
      - Effort values: ${Object.values(Effort).join(', ')}
      - Maturity Level values: ${Object.values(MaturityLevel).join(', ')}

      **Project Context to Analyze:**
      \`\`\`
      ${projectContext}
      \`\`\`

      **Your Mandate:**
      Produce a detailed, insightful, and actionable report.
      - **projectName**: Extract the project name from the context.
      - **analysisType**: Must be "${analysisType}".
      - **summary**: A concise executive summary of your key findings.
      - **strengths**: A list of key positive aspects directly observed from the context.
      - **improvements**: A prioritized list of areas for improvement. Each must have a clear title, description, priority, difficulty, and tangible business impact.
      - **nextSteps**: Concrete short-term and long-term actions.
      - **viability**: An overall viability score from 1 (very low) to 10 (excellent) with a strong justification based on the analysis.
      - **roiAnalysis**: An assessment of the potential return on investment, including potential gains and estimated effort.
      - **maturity**: Assess the project's current maturity level with justification.

      Your response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, notes, or explanations outside of the JSON structure.
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