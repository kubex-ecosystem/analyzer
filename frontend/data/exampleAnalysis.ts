import { ProjectAnalysis, HistoryItem, Priority, Difficulty, Effort, AnalysisType, MaturityLevel } from '../types';

type TFunction = (key: string, options?: any) => string;

// Este é o item mais recente da história, o que será exibido.
export const exampleAnalysis = (t: TFunction): ProjectAnalysis => ({
  projectName: t('example:kortex.projectName'),
  analysisType: AnalysisType.General,
  summary: t('example:kortex.summary'),
  strengths: [
    t('example:kortex.strengths.s1'),
    t('example:kortex.strengths.s2'),
    t('example:kortex.strengths.s3'),
    t('example:kortex.strengths.s4'),
    t('example:kortex.strengths.s5')
  ],
  improvements: [
    {
      title: t('example:kortex.improvements.i1.title'),
      description: t('example:kortex.improvements.i1.description'),
      priority: Priority.High,
      difficulty: Difficulty.Medium,
      businessImpact: t('example:kortex.improvements.i1.businessImpact')
    },
    {
      title: t('example:kortex.improvements.i2.title'),
      description: t('example:kortex.improvements.i2.description'),
      priority: Priority.Medium,
      difficulty: Difficulty.High,
      businessImpact: t('example:kortex.improvements.i2.businessImpact')
    },
    {
      title: t('example:kortex.improvements.i3.title'),
      description: t('example:kortex.improvements.i3.description'),
      priority: Priority.Medium,
      difficulty: Difficulty.Medium,
      businessImpact: t('example:kortex.improvements.i3.businessImpact')
    }
  ],
  nextSteps: {
    shortTerm: [
      {
        title: t('example:kortex.nextSteps.shortTerm.s1.title'),
        description: t('example:kortex.nextSteps.shortTerm.s1.description'),
        difficulty: Difficulty.Medium
      },
      {
        title: t('example:kortex.nextSteps.shortTerm.s2.title'),
        description: t('example:kortex.nextSteps.shortTerm.s2.description'),
        difficulty: Difficulty.Low
      }
    ],
    longTerm: [
      {
        title: t('example:kortex.nextSteps.longTerm.l1.title'),
        description: t('example:kortex.nextSteps.longTerm.l1.description'),
        difficulty: Difficulty.High
      },
      {
        title: t('example:kortex.nextSteps.longTerm.l2.title'),
        description: t('example:kortex.nextSteps.longTerm.l2.description'),
        difficulty: Difficulty.High
      }
    ]
  },
  viability: {
    score: 9,
    assessment: t('example:kortex.viability.assessment')
  },
  roiAnalysis: {
    assessment: t('example:kortex.roi.assessment'),
    potentialGains: [
      t('example:kortex.roi.gains.g1'),
      t('example:kortex.roi.gains.g2'),
      t('example:kortex.roi.gains.g3'),
      t('example:kortex.roi.gains.g4')
    ],
    estimatedEffort: Effort.Medium,
  },
  maturity: {
    level: MaturityLevel.Production,
    assessment: t('example:kortex.maturity.assessment')
  },
  usageMetadata: {
    promptTokenCount: 1850,
    candidatesTokenCount: 650,
    totalTokenCount: 2500,
  }
});

// Histórico fictício expandido para o modo de exemplo
export const exampleHistory = (t: TFunction, locale: 'en-US' | 'pt-BR'): HistoryItem[] => {
    const mainAnalysis = exampleAnalysis(t);

    return [
      // --- Projeto: Kortex ---
      // Mais recente (corresponde a `exampleAnalysis`)
      {
        id: 1004,
        projectName: mainAnalysis.projectName,
        analysisType: AnalysisType.General,
        timestamp: new Date("2025-07-25T10:00:00").toLocaleString(locale),
        analysis: mainAnalysis,
        projectContext: t('example:projectContext'),
      },
      // Análise intermediária (teve uma queda)
      {
        id: 1003,
        projectName: mainAnalysis.projectName,
        analysisType: AnalysisType.General,
        timestamp: new Date("2025-07-18T14:30:00").toLocaleString(locale),
        analysis: {
          ...mainAnalysis,
          viability: { score: 7, assessment: t('example:history.kortex.h1.assessment') },
          maturity: { ...mainAnalysis.maturity, level: MaturityLevel.MVP },
          usageMetadata: { promptTokenCount: 1800, candidatesTokenCount: 590, totalTokenCount: 2390 },
        },
        projectContext: t('example:projectContext'),
      },
      // Análise inicial
      {
        id: 1002,
        projectName: mainAnalysis.projectName,
        analysisType: AnalysisType.General,
        timestamp: new Date("2025-07-10T09:15:00").toLocaleString(locale),
        analysis: {
          ...mainAnalysis,
          viability: { score: 8, assessment: t('example:history.kortex.h2.assessment') },
          maturity: { ...mainAnalysis.maturity, level: MaturityLevel.MVP },
          usageMetadata: { promptTokenCount: 1750, candidatesTokenCount: 610, totalTokenCount: 2360 },
        },
        projectContext: t('example:projectContext'),
      },
      // Análise de segurança (outro tipo)
      {
        id: 1001,
        projectName: mainAnalysis.projectName,
        analysisType: AnalysisType.Security,
        timestamp: new Date("2025-07-05T11:00:00").toLocaleString(locale),
        analysis: {
          ...mainAnalysis,
          analysisType: AnalysisType.Security,
          summary: t('example:history.kortex.h3.summary'),
          viability: { score: 7, assessment: t('example:history.kortex.h3.assessment') },
          maturity: { ...mainAnalysis.maturity, level: MaturityLevel.Prototype },
          usageMetadata: { promptTokenCount: 2100, candidatesTokenCount: 720, totalTokenCount: 2820 },
        },
        projectContext: t('example:projectContext'),
      },
      // Análise mais antiga (score mais baixo)
      {
        id: 1000,
        projectName: t('example:history.kortex.h4.projectName'),
        analysisType: AnalysisType.General,
        timestamp: new Date("2025-07-02T16:45:00").toLocaleString(locale),
        analysis: {
          ...mainAnalysis,
          projectName: t('example:history.kortex.h4.projectName'),
          viability: { score: 6, assessment: t('example:history.kortex.h4.assessment') },
          maturity: { ...mainAnalysis.maturity, level: MaturityLevel.Prototype },
          usageMetadata: { promptTokenCount: 1700, candidatesTokenCount: 550, totalTokenCount: 2250 },
        },
        projectContext: t('example:projectContext'),
      },

      // --- Projeto: Orion UI Kit ---
      {
        id: 1005,
        projectName: t('example:history.orion.projectName'),
        analysisType: AnalysisType.CodeQuality,
        timestamp: new Date("2025-07-26T11:00:00").toLocaleString(locale),
        analysis: {
          ...mainAnalysis, // Reutilizando a estrutura para simplificar
          projectName: t('example:history.orion.projectName'),
          analysisType: AnalysisType.CodeQuality,
          summary: t('example:history.orion.summary'),
          viability: { score: 8, assessment: t('example:history.orion.assessment') },
          maturity: { level: MaturityLevel.Optimized, assessment: t('example:history.orion.maturityAssessment') },
          usageMetadata: { promptTokenCount: 1500, candidatesTokenCount: 450, totalTokenCount: 1950 },
        },
        projectContext: t('example:projectContext'),
      },
    ];
};
