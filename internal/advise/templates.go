package advise

import (
	"encoding/json"
	"fmt"
)

type Mode string

const (
	ModeExec      Mode = "exec"      // P1
	ModeCode      Mode = "code"      // P2
	ModeOps       Mode = "ops"       // P3
	ModeCommunity Mode = "community" // P4
)

// systemPrompt monta instrução “seca” com contrato de saída em JSON.
// Esquemas seguem o spec P1–P4. (ver doc de métricas) &#x20;
func systemPrompt(m Mode) string {
	switch m {
	case ModeExec:
		return `You are a precise repository analyst. Use ONLY the provided JSON (scorecard v1). No speculation.
Output strict JSON:
{"summary":{"grade":"A|B|C|...","chi":0-100,"lead_time_p95_hours":number,"deploys_per_week":number},
"top_focus":[{"title":string,"why":string,"kpi":string,"target":string,"confidence":0..1}],
"quick_wins":[{"action":string,"effort":"S|M|L","expected_gain":string}],
"risks":[{"risk":string,"mitigation":string}],
"call_to_action":string}`
	case ModeCode:
		return `Senior code-quality advisor. Optimize CHI with minimal disruption.
Output JSON:
{"chi_now":number,
"drivers":[{"metric":"mi|duplication_pct|cyclomatic_avg","value":number,"impact":"high|med|low"}],
"refactor_plan":[{"step":number,"theme":"duplication|complexity|tests","actions":[string],"kpi":string,"target":string}],
"guardrails":[string],
"milestones":[{"in_days":14,"goal":string},{"in_days":30,"goal":string}]}`
	case ModeOps:
		return `Pragmatic DevOps coach. Use only the data. Output JSON:
{"lead_time_p95_hours":number,"deployment_frequency_per_week":number,"change_fail_rate_pct":number,"mttr_hours":number,
"bottlenecks":[{"area":"review|pipeline|batch_size|release","evidence":string}],
"playbook":[{"name":string,"policy":string,"expected_effect":string}],
"experiments":[{"A/B":string,"metric":"lead_time_p95|CFR|MTTR","duration_days":number}]}`

	case ModeCommunity:
		return `Community growth advisor. Be concrete and low-friction. Output JSON:


{"bus_factor":number,"onboarding_p50_days":number|null,
"roadmap":[{"item":string,"why":string,"success_metric":string}],
"visibility":[{"asset":string,"kpi":string,"effort":"S|M|L"}]}`
	default:
		return "You are a precise repository analyst. Output valid JSON."
	}
}

func userPrompt(scorecard any, hotspots []string) string {
	sb, _ := json.Marshal(scorecard)
	hb, _ := json.Marshal(hotspots)
	return fmt.Sprintf("Here is scorecard.json (v1): %snOptional hotspots: %s", sb, hb)
}
