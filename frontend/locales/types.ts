// Types for translation structure
export interface TranslationMessages {
  header: {
    title: string;
    subtitle: string;
  };
  navigation: {
    dashboard: string;
    newAnalysis: string;
    currentAnalysis: string;
    kanban: string;
    history: string;
    chat: string;
  };
  actions: {
    analyzeProject: string;
    analyzing: string;
    uploadFile: string;
    showExample: string;
    exitExample: string;
    load: string;
    showMore: string;
    view: string;
    createKanbanBoard: string;
    viewKanbanBoard: string;
  };
  common: {
    title: string;
    description: string;
    priority: string;
    difficulty: string;
    delete: string;
    save: string;
    cancel: string;
    confirm: string;
    connect: string;
    notConnected: string;
  };
  priority: {
    Low: string;
    Medium: string;
    High: string;
  };
  difficulty: {
    Low: string;
    Medium: string;
    High: string;
  };
  effort: {
    Low: string;
    Medium: string;
    High: string;
  };
  status: {
    TODO: string;
    InProgress: string;
    Done: string;
    Blocked: string;
  };
  loader: {
    loading: string;
    uploading: string;
    analyzing: string;
    saving: string;
  };
  feedback: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  network: {
    connecting: string;
    connected: string;
    disconnected: string;
    connectionError: string;
    retry: string;
    online: string;
  };
  tokenUsage: {
    title: string;
    inputTokens: string;
    outputTokens: string;
    totalTokens: string;
    estimatedCost: string;
  };
  settings: {
    language: string;
    theme: string;
    appearance: string;
  };
}

export interface AnalysisTranslations {
  results: {
    title: string;
    summary: {
      title: string;
    };
    viability: {
      title: string;
      scoreLabel: string;
      assessmentLabel: string;
      scoreEvolution: string;
    };
    roi: {
      title: string;
      assessmentLabel: string;
      effortLabel: string;
      gainsLabel: string;
    };
    strengths: {
      title: string;
    };
    improvements: {
      title: string;
      impact: string;
      businessImpact: string;
    };
    nextSteps: {
      title: string;
      shortTerm: string;
      longTerm: string;
    };
    timeline: {
      title: string;
      phases: string;
      estimatedDuration: string;
    };
    risks: {
      title: string;
      technical: string;
      business: string;
      mitigation: string;
    };
    metrics: {
      title: string;
      current: string;
      target: string;
      kpi: string;
    };
    resources: {
      title: string;
      teamSize: string;
      budget: string;
      technology: string;
    };
    conclusion: {
      title: string;
      recommendation: string;
      confidence: string;
    };
  };
  comparison: {
    title: string;
    analyzing: string;
    differences: string;
    similarities: string;
    evolution: string;
    summary: string;
  };
}

export interface ChatTranslations {
  title: string;
  placeholder: string;
  send: string;
  typing: string;
  clear: string;
  history: string;
  export: string;
  import: string;
  messages: {
    welcome: string;
    error: string;
    thinking: string;
    noMessages: string;
  };
}

export interface DashboardTranslations {
  welcome: string;
  recentAnalyses: string;
  quickActions: string;
  statistics: string;
  noAnalyses: string;
  performanceMetrics: string;
  scoreEvolution: string;
  usage: {
    title: string;
    totalAnalyses: string;
    averageScore: string;
    successRate: string;
  };
  emptyState: {
    title: string;
    subtitle: string;
    cta: string;
    kpi_total_description: string;
    kpi_score_description: string;
    kpi_type_description: string;
    kpi_tokens_description: string;
  };
  kpi: {
    totalAnalyses: string;
    totalAnalyses_description: string;
    averageScore: string;
    averageScore_description: string;
    commonType: string;
    commonType_description: string;
    tokensThisMonth: string;
    tokensThisMonth_description: string;
  };
  projects: {
    title: string;
    allProjects: string;
    recentAnalyses: string;
  };
}

export interface ExampleTranslations {
  mode: {
    title: string;
    description: string;
    notice: string;
  };
  project: {
    name: string;
    description: string;
    type: string;
    domain: string;
  };
}

export interface InputTranslations {
  title: string;
  projectContext: {
    label: string;
    placeholder: string;
    description: string;
  };
  analysisType: {
    label: string;
    options: {
      full: string;
      quick: string;
      focused: string;
      comparative: string;
    };
  };
  analysisTypes: {
    GENERAL: {
      label: string;
      description: string;
    };
    SECURITY: {
      label: string;
      description: string;
    };
    SCALABILITY: {
      label: string;
      description: string;
    };
    CODE_QUALITY: {
      label: string;
      description: string;
    };
  };
  uploadArea: {
    title: string;
    description: string;
    supportedFormats: string;
    dragDrop: string;
    clickToUpload: string;
  };
  validation: {
    required: string;
    minLength: string;
    maxLength: string;
    invalidFormat: string;
  };
}

export interface KanbanTranslations {
  title: string;
  columns: {
    todo: string;
    inProgress: string;
    done: string;
    blocked: string;
  };
  actions: {
    addCard: string;
    editCard: string;
    deleteCard: string;
    moveCard: string;
  };
  card: {
    title: string;
    description: string;
    priority: string;
    difficulty: string;
    assignee: string;
    dueDate: string;
    tags: string;
  };
  filters: {
    all: string;
    byPriority: string;
    byAssignee: string;
    byTag: string;
  };
}

export interface LandingTranslations {
  cta: string;
  featuresTitle: string;
  featuresSubtitle: string;
  dynamicPhrases: string[];
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  features: {
    title: string;
    aiDriven: {
      title: string;
      description: string;
    };
    comprehensive: {
      title: string;
      description: string;
    };
    actionable: {
      title: string;
      description: string;
    };
  };
  howItWorks: {
    title: string;
    step1: {
      title: string;
      description: string;
    };
    step2: {
      title: string;
      description: string;
    };
    step3: {
      title: string;
      description: string;
    };
  };
}

export interface SettingsTranslations {
  title: string;
  general: {
    title: string;
    language: string;
    theme: string;
  };
  notifications: {
    title: string;
    email: string;
    push: string;
    desktop: string;
  };
  privacy: {
    title: string;
    analytics: string;
    cookies: string;
  };
  account: {
    title: string;
    profile: string;
    security: string;
    billing: string;
  };
}

export interface AuthTranslations {
  logout: string;
}

export interface HistoryTranslations {
  title: string;
}

export interface ProfileTranslations {
  title: string;
}

export interface TabsTranslations {
  profile: string;
  preferences: string;
  integrations: string;
  data: string;
}

// Main locale type combining all translations
export interface LocaleTranslations {
  common: TranslationMessages;
  analysis: AnalysisTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
  dashboard: DashboardTranslations;
  example: ExampleTranslations;
  history: HistoryTranslations;
  input: InputTranslations;
  kanban: KanbanTranslations;
  landing: LandingTranslations;
  profile: ProfileTranslations;
  settings: SettingsTranslations;
  tabs: TabsTranslations;
}

export type SupportedLocale = 'en-US' | 'pt-BR';
export type TranslationNamespace = keyof LocaleTranslations;
