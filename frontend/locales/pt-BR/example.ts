import { ExampleTranslations } from '../types';

export const examplePtBR: ExampleTranslations = {
  mode: {
    title: "Modo de Exemplo",
    description: "Esta é uma análise de exemplo para demonstrar as capacidades da ferramenta",
    notice: "Você está no modo de exemplo"
  },
  project: {
    name: "Sistema de E-commerce",
    description: "Um projeto de exemplo para demonstração",
    type: "Aplicação Web",
    domain: "E-commerce"
  },
  kortex: {
    projectName: "Kortex - Plataforma de AI",
    summary: "Uma plataforma inovadora que integra múltiplas tecnologias de inteligência artificial para otimizar processos empresariais, oferecendo análises preditivas, automação inteligente e insights em tempo real.",
    strengths: {
      s1: "Arquitetura modular e escalável baseada em microsserviços",
      s2: "Integração robusta com múltiplas APIs de AI (OpenAI, Google, Anthropic)",
      s3: "Interface de usuário intuitiva com experiência otimizada",
      s4: "Sistema de cache inteligente que reduz latência em 40%",
      s5: "Monitoramento em tempo real com alertas proativos"
    },
    improvements: {
      i1: {
        title: "Implementar Sistema de Autenticação Multi-Fator",
        description: "Adicionar camadas extras de segurança com 2FA/MFA para proteger dados sensíveis e contas de usuários administrativos.",
        businessImpact: "Aumenta a confiança do cliente e reduz riscos de segurança em 85%"
      },
      i2: {
        title: "Otimizar Performance do Processamento de AI",
        description: "Implementar processamento paralelo e cache distribuído para reduzir tempo de resposta das análises de AI.",
        businessImpact: "Melhora experiência do usuário e permite atender 300% mais requisições"
      },
      i3: {
        title: "Desenvolver Dashboard de Analytics Avançado",
        description: "Criar painéis interativos com métricas em tempo real, tendências e insights acionáveis para tomada de decisão.",
        businessImpact: "Aumenta valor percebido pelo cliente e permite pricing premium de 25%"
      }
    },
    nextSteps: {
      shortTerm: {
        s1: {
          title: "Configurar Testes de Carga",
          description: "Implementar suíte completa de testes automatizados para validar performance sob diferentes cargas de trabalho"
        },
        s2: {
          title: "Documentar APIs",
          description: "Criar documentação técnica detalhada para facilitar integração de terceiros e onboarding da equipe"
        }
      },
      longTerm: {
        l1: {
          title: "Migração para Arquitetura Serverless",
          description: "Transição gradual para infraestrutura serverless para reduzir custos operacionais e melhorar escalabilidade"
        },
        l2: {
          title: "Implementar Machine Learning Personalizado",
          description: "Desenvolver modelos de ML customizados para oferecer insights mais precisos e específicos por setor"
        }
      }
    },
    viability: {
      assessment: "Projeto altamente viável com forte potencial de mercado e equipe técnica capacitada. Roadmap claro e tecnologias maduras."
    },
    roi: {
      assessment: "ROI esperado de 320% em 18 meses com base em projeções conservadoras de mercado e redução de custos operacionais.",
      gains: {
        g1: "Redução de 40% nos custos operacionais através de automação",
        g2: "Aumento de 25% na produtividade da equipe técnica",
        g3: "Capacidade de atender 300% mais clientes com mesma infraestrutura",
        g4: "Posicionamento premium no mercado com pricing 35% superior"
      }
    },
    maturity: {
      assessment: "Sistema maduro em produção com alta estabilidade, monitoramento completo e processos de deploy automatizados estabelecidos."
    }
  },
  projectContext: "Plataforma de IA empresarial desenvolvida em React + Node.js, focada em integração de múltiplos serviços de AI para automação de processos",
  history: {
    kortex: {
      h1: {
        assessment: "Houve uma queda temporária na viabilidade devido a mudanças no mercado, mas as melhorias implementadas restabeleceram a confiança."
      },
      h2: {
        assessment: "Análise inicial mostrou grande potencial, com arquitetura sólida e equipe comprometida estabelecendo base forte para crescimento."
      },
      h3: {
        summary: "Análise de segurança identificou vulnerabilidades críticas que foram posteriormente corrigidas, fortalecendo a postura de segurança geral.",
        assessment: "Apesar das vulnerabilidades encontradas, a resposta rápida da equipe e implementação de correções demonstraram maturidade do processo."
      }
    }
  }
};
