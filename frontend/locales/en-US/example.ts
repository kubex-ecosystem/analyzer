import { ExampleTranslations } from '../types';

export const exampleEnUS: ExampleTranslations = {
  mode: {
    title: "Example Mode",
    description: "This is an example analysis to demonstrate the tool's capabilities",
    notice: "You are in example mode"
  },
  project: {
    name: "E-commerce System",
    description: "An example project for demonstration",
    type: "Web Application",
    domain: "E-commerce"
  },
  kortex: {
    projectName: "Kortex - AI Platform",
    summary: "An innovative platform that integrates multiple artificial intelligence technologies to optimize business processes, offering predictive analytics, intelligent automation, and real-time insights.",
    strengths: {
      s1: "Modular and scalable microservices-based architecture",
      s2: "Robust integration with multiple AI APIs (OpenAI, Google, Anthropic)",
      s3: "Intuitive user interface with optimized experience",
      s4: "Intelligent caching system that reduces latency by 40%",
      s5: "Real-time monitoring with proactive alerts"
    },
    improvements: {
      i1: {
        title: "Implement Multi-Factor Authentication System",
        description: "Add extra security layers with 2FA/MFA to protect sensitive data and administrative user accounts.",
        businessImpact: "Increases customer trust and reduces security risks by 85%"
      },
      i2: {
        title: "Optimize AI Processing Performance",
        description: "Implement parallel processing and distributed cache to reduce AI analysis response time.",
        businessImpact: "Improves user experience and enables handling 300% more requests"
      },
      i3: {
        title: "Develop Advanced Analytics Dashboard",
        description: "Create interactive panels with real-time metrics, trends, and actionable insights for decision making.",
        businessImpact: "Increases customer perceived value and enables 25% premium pricing"
      }
    },
    nextSteps: {
      shortTerm: {
        s1: {
          title: "Set Up Load Testing",
          description: "Implement comprehensive automated test suite to validate performance under different workloads"
        },
        s2: {
          title: "Document APIs",
          description: "Create detailed technical documentation to facilitate third-party integration and team onboarding"
        }
      },
      longTerm: {
        l1: {
          title: "Migration to Serverless Architecture",
          description: "Gradual transition to serverless infrastructure to reduce operational costs and improve scalability"
        },
        l2: {
          title: "Implement Custom Machine Learning",
          description: "Develop custom ML models to offer more accurate and sector-specific insights"
        }
      }
    },
    viability: {
      assessment: "Highly viable project with strong market potential and capable technical team. Clear roadmap and mature technologies."
    },
    roi: {
      assessment: "Expected ROI of 320% in 18 months based on conservative market projections and operational cost reduction.",
      gains: {
        g1: "40% reduction in operational costs through automation",
        g2: "25% increase in technical team productivity",
        g3: "Ability to serve 300% more customers with same infrastructure",
        g4: "Premium market positioning with 35% higher pricing"
      }
    },
    maturity: {
      assessment: "Mature system in production with high stability, complete monitoring, and established automated deployment processes."
    }
  },
  projectContext: "Enterprise AI platform developed in React + Node.js, focused on integrating multiple AI services for business process automation",
  history: {
    kortex: {
      h1: {
        assessment: "There was a temporary drop in viability due to market changes, but implemented improvements restored confidence."
      },
      h2: {
        assessment: "Initial analysis showed great potential, with solid architecture and committed team establishing a strong foundation for growth."
      },
      h3: {
        summary: "Security analysis identified critical vulnerabilities that were subsequently fixed, strengthening overall security posture.",
        assessment: "Despite vulnerabilities found, the team's quick response and implementation of fixes demonstrated process maturity."
      },
      h4: {
        projectName: "Kortex Advanced Analytics v4.2",
        summary: "Scalability review revealed data architecture bottlenecks, resulting in significant cache system optimizations.",
        assessment: "Implemented performance improvements exceeded expectations, increasing capacity by 300% and reducing latency by 60%."
      }
    },
    orion: {
      projectName: "Orion Spatial Intelligence",
      summary: "Complementary platform specialized in geospatial data analysis and location intelligence for logistics optimization.",
      assessment: "Complementary project to Kortex focused on spatial data analysis, demonstrating potential synergy between platforms.",
      maturityAssessment: "System in beta phase with stable core functionalities and clear roadmap for full integration with Kortex ecosystem."
    }
  }
};
