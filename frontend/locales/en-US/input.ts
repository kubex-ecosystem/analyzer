import { InputTranslations } from '../types';

export const inputEnUS: InputTranslations = {
  title: "Data Input",
  projectContext: {
    label: "Project Context",
    placeholder: "Describe your project here...",
    description: "Provide details about your project for analysis"
  },
  analysisType: {
    label: "Analysis Type",
    options: {
      full: "Full Analysis",
      quick: "Quick Analysis",
      focused: "Focused Analysis",
      comparative: "Comparative Analysis"
    }
  },
  analysisTypes: {
    GENERAL: {
      label: "General Analysis",
      description: "Comprehensive evaluation of architecture, quality, and project viability"
    },
    SECURITY: {
      label: "Security Analysis",
      description: "Focus on vulnerabilities, security practices, and compliance"
    },
    SCALABILITY: {
      label: "Scalability Analysis",
      description: "Assessment of system growth capacity and performance"
    },
    CODE_QUALITY: {
      label: "Code Quality",
      description: "Analysis of patterns, maintainability, and development best practices"
    }
  },
  uploadArea: {
    title: "Upload Area",
    description: "Upload project files",
    supportedFormats: "Supported formats",
    dragDrop: "Drag and drop files here",
    clickToUpload: "Click to upload"
  },
  validation: {
    required: "Required field",
    minLength: "Minimum characters required",
    maxLength: "Maximum characters exceeded",
    invalidFormat: "Invalid format"
  }
};
