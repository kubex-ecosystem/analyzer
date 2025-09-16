import { z } from 'zod';

// Schema for exec mode response
export const ExecSchema = z.object({
  summary: z.object({
    grade: z.string(),
    chi: z.number(),
    lead_time_p95_hours: z.number(),
    deploys_per_week: z.number(),
  }),
  top_focus: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      kpi: z.string(),
      target: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
  quick_wins: z.array(
    z.object({
      action: z.string(),
      effort: z.enum(['S', 'M', 'L']),
      expected_gain: z.string(),
    })
  ),
  risks: z.array(
    z.object({
      risk: z.string(),
      mitigation: z.string(),
    })
  ),
  call_to_action: z.string(),
});

// Schema for code mode response
export const CodeSchema = z.object({
  chi_now: z.number(),
  drivers: z.array(
    z.object({
      metric: z.string(),
      value: z.number(),
      impact: z.enum(['high', 'med', 'low']),
    })
  ),
  refactor_plan: z.array(
    z.object({
      step: z.number(),
      theme: z.string(),
      actions: z.array(z.string()),
      kpi: z.string(),
      target: z.string(),
    })
  ),
  guardrails: z.array(z.string()),
  milestones: z.array(
    z.object({
      in_days: z.number(),
      goal: z.string(),
    })
  ),
});

// Schema for advise request
export const AdviseRequestSchema = z.object({
  mode: z.enum(['exec', 'code']),
  provider: z.string().optional(),
  context: z.object({
    repository: z.string().optional(),
    hotspots: z.array(z.string()).optional(),
    scorecard: z.record(z.any(), z.string()).optional(),
  }).optional(),
  options: z.object({
    timeout_sec: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
  }).optional(),
});

// Union type for response validation
export const AdviseResponseSchema = z.union([ExecSchema, CodeSchema]);

// Type exports
export type ExecResponse = z.infer<typeof ExecSchema>;
export type CodeResponse = z.infer<typeof CodeSchema>;
export type AdviseRequest = z.infer<typeof AdviseRequestSchema>;
export type AdviseResponse = z.infer<typeof AdviseResponseSchema>;
