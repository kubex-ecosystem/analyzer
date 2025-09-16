import { InputTranslations } from '../types';

export const inputPtBR: InputTranslations = {
  title: "Entrada de Dados",
  projectContext: {
    label: "Contexto do Projeto",
    placeholder: "Descreva seu projeto aqui...",
    description: "Forneça detalhes sobre seu projeto para análise"
  },
  analysisType: {
    label: "Tipo de Análise",
    options: {
      full: "Análise Completa",
      quick: "Análise Rápida",
      focused: "Análise Focada",
      comparative: "Análise Comparativa"
    }
  },
  analysisTypes: {
    GENERAL: {
      label: "Análise Geral",
      description: "Avaliação abrangente de arquitetura, qualidade e viabilidade do projeto"
    },
    SECURITY: {
      label: "Análise de Segurança",
      description: "Foco em vulnerabilidades, práticas de segurança e conformidade"
    },
    SCALABILITY: {
      label: "Análise de Escalabilidade",
      description: "Avaliação da capacidade de crescimento e performance do sistema"
    },
    CODE_QUALITY: {
      label: "Qualidade de Código",
      description: "Análise de padrões, manutenibilidade e boas práticas de desenvolvimento"
    }
  },
  uploadArea: {
    title: "Área de Upload",
    description: "Faça upload dos arquivos do projeto",
    supportedFormats: "Formatos suportados",
    dragDrop: "Arraste e solte arquivos aqui",
    clickToUpload: "Clique para fazer upload"
  },
  validation: {
    required: "Campo obrigatório",
    minLength: "Mínimo de caracteres necessário",
    maxLength: "Máximo de caracteres excedido",
    invalidFormat: "Formato inválido"
  }
};
