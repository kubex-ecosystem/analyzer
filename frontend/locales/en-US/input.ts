import { InputTranslations } from '../types';

export const inputEnUS: InputTranslations = {
  title: "Data Input",
  addFile: "Add File",
  uploadFiles: "Upload Files",
  importFromGithub: "Import from GitHub",
  subtitle: "Analyze your project context and files",
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
    },
    DOCUMENTATION_REVIEW: {
      label: "Documentation Review",
      description: "Analysis of project documentation quality and completeness"
    }
  },
  noFiles: {
    title: "No files added",
    subtitle: "Add project files to start analysis"
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
  },
  notifications: {
    lookAtniSuccess: "{{count}} file(s) successfully extracted from LookAtni!",
    fragmentsSelected: "{{count}} code fragment(s) selected for analysis!"
  }
};
