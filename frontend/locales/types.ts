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
    close: string;
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
  maturityLevels: {
    PROTOTYPE: string;
    MVP: string;
    PRODUCTION: string;
    OPTIMIZED: string;
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
  history: {
    compareProjectMismatchError: string;
    compareMismatchError: string;
  };
  showExample: string;
  analysisTitle: string;
  save: string;
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
    maturity: {
      title: string;
    };
    usageMetadata: {
      ariaLabel: string;
      total: string;
      tokens: string;
    };
    exampleModeNotice: string;
  };
  export: {
    json: string;
    jsonAriaLabel: string;
    log: string;
    logAriaLabel: string;
    logContent: {
      mainTitle: string;
    };
  };
  feedback: {
    question: string;
    useful: string;
    notUseful: string;
    thanks: string;
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
    analysesFor: string;
    noAnalysesForProject: string;
    viewAllProjects: string;
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
  kortex: {
    projectName: string;
    summary: string;
    strengths: {
      s1: string;
      s2: string;
      s3: string;
      s4: string;
      s5: string;
    };
    improvements: {
      i1: {
        title: string;
        description: string;
        businessImpact: string;
      };
      i2: {
        title: string;
        description: string;
        businessImpact: string;
      };
      i3: {
        title: string;
        description: string;
        businessImpact: string;
      };
    };
    nextSteps: {
      shortTerm: {
        s1: {
          title: string;
          description: string;
        };
        s2: {
          title: string;
          description: string;
        };
      };
      longTerm: {
        l1: {
          title: string;
          description: string;
        };
        l2: {
          title: string;
          description: string;
        };
      };
    };
    viability: {
      assessment: string;
    };
    roi: {
      assessment: string;
      gains: {
        g1: string;
        g2: string;
        g3: string;
        g4: string;
      };
    };
    maturity: {
      assessment: string;
    };
  };
  projectContext: string;
  history: {
    kortex: {
      h1: {
        assessment: string;
      };
      h2: {
        assessment: string;
      };
      h3: {
        summary: string;
        assessment: string;
      };
      h4: {
        projectName: string;
        summary: string;
        assessment: string;
      };
    };
    orion: {
      projectName: string;
      summary: string;
      assessment: string;
      maturityAssessment: string;
    };
  };
}

export interface InputTranslations {
  title: string;
  addFile: string;
  uploadFiles: string;
  importFromGithub: string;
  subtitle: string;
  fileInput: {
    label: string;
    placeholder: string;
    description: string;
  };
  githubInput: {
    label: string;
    placeholder: string;
    description: string;
  };
  orText: string;
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
    DOCUMENTATION_REVIEW: {
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
  noFiles: {
    title: string;
    subtitle: string;
  };
  validation: {
    required: string;
    minLength: string;
    maxLength: string;
    invalidFormat: string;
  };
  notifications: {
    lookAtniSuccess: string;
    fragmentsSelected: string;
  };
}

export interface KanbanTranslations {
  title: string;
  projectHeader: string;
  addCard: string;
  editCard: string;
  originalDescription: string;
  notes: string;
  notesPlaceholder: string;
  exampleModeNotice: string;
  deleteConfirm: {
    title: string;
    message: string;
    confirm: string;
  };
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
  clearAll: string;
  compare: string;
  importAnalysis: string;
  empty: {
    title: string;
    subtitle: string;
  };
  clearConfirm: {
    title: string;
    message: string;
  };
  notifications: {
    invalidFile: string;
  };
  importFile: {
    label: string;
    placeholder: string;
    description: string;
  };
  closePanel: string;
  selectItem: string;
  deleteItem: string;
  itemSelected: string;
  itemsSelected: string;
}

export interface ProfileTranslations {
  title: string;
  avatar: {
    change: string;
  };
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  save: string;
}

export interface TabsTranslations {
  profile: string;
  preferences: string;
  integrations: string;
  data: string;
}

// Files namespace
export interface FilesTranslations {
  title: string;
  addFromUpload: string;
  addFile: string;
  emptyState: string;
}

// Data Sources namespace
export interface DataSourcesTranslations {
  github: {
    placeholder: string;
  };
}

// GitHub Search namespace
export interface GithubSearchTranslations {
  button: string;
}

// Token Usage namespace
export interface TokenUsageTranslations {
  monthlyUsage: string;
  title: string;
  usageText: string;
}

// Import Export namespace
export interface ImportExportTranslations {
  title: string;
  description: string;
  warning: string;
  importLabel: string;
  exportLabel: string;
  confirm: {
    title: string;
    message: string;
  };
}

// Notifications namespace
export interface NotificationsTranslations {
  importSuccess: string;
  analysisImportSuccess: string;
  emptyContext: string;
  selectTwo: string;
  exampleLoaded: string;
  noAnalysisForChat: string;
  settingsSaved: string;
  profileSaved: string;
  exportSuccess: string;
  exportError: string;
  importError: string;
  importAborted: string;
  apiKeyTestSuccess: string;
  apiKeyTestFailure: string;
  apiKeyTestEmpty: string;
  chatError: string;
  lookAtniSuccess: string;
  fragmentsSelected: string;
  fileLoaded: string;
  repoImportSuccess: string;
  noGithubPat: string;
}

// Main locale type combining all translations
export interface LocaleTranslations {
  common: TranslationMessages;
  analysis: AnalysisTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
  dashboard: DashboardTranslations;
  dataSources: DataSourcesTranslations;
  example: ExampleTranslations;
  files: FilesTranslations;
  githubSearch: GithubSearchTranslations;
  history: HistoryTranslations;
  importExport: ImportExportTranslations;
  input: InputTranslations;
  kanban: KanbanTranslations;
  landing: LandingTranslations;
  notifications: NotificationsTranslations;
  profile: ProfileTranslations;
  settings: SettingsTranslations;
  tabs: TabsTranslations;
  tokenUsage: TokenUsageTranslations;
}

export type SupportedLocale = 'en-US' | 'pt-BR';
export type TranslationNamespace = keyof LocaleTranslations;
