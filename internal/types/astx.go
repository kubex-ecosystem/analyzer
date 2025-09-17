package types

import "time"

// ===== TIPOS DE DADOS =====

type I18nUsage struct {
	Key             string         `json:"key"`
	FilePath        string         `json:"filePath"`
	Line            int            `json:"line"`
	Column          int            `json:"column"`
	Component       string         `json:"component"`
	FunctionContext string         `json:"functionContext"`
	JSXContext      string         `json:"jsxContext"`
	Props           []string       `json:"props"`
	Imports         []string       `json:"imports"`
	NearbyCode      []string       `json:"nearbyCode"`
	CallType        string         `json:"callType"`
	Timestamp       time.Time      `json:"timestamp"`
	AIContext       *AIContextData `json:"aiContext,omitempty"`
}

type AIContextData struct {
	ComponentPurpose string   `json:"componentPurpose"`
	UIElementType    string   `json:"uiElementType"`
	UserInteraction  bool     `json:"userInteraction"`
	BusinessContext  string   `json:"businessContext"`
	SuggestedKeys    []string `json:"suggestedKeys"`
	QualityScore     int      `json:"qualityScore"`
}

type ProjectStats struct {
	TotalUsages       int               `json:"totalUsages"`
	CoveragePercent   float64           `json:"coveragePercent"`
	QualityScore      float64           `json:"qualityScore"`
	UsagesByType      map[string]int    `json:"usagesByType"`
	UsagesByComponent map[string]int    `json:"usagesByComponent"`
	MissingKeys       []string          `json:"missingKeys"`
	HardcodedStrings  []HardcodedString `json:"hardcodedStrings"`
	LastUpdate        time.Time         `json:"lastUpdate"`
}

type HardcodedString struct {
	Text     string `json:"text"`
	FilePath string `json:"filePath"`
	Line     int    `json:"line"`
	Context  string `json:"context"`
}

type ChangeEvent struct {
	Type      string      `json:"type"` // "added", "removed", "modified", "stats_updated"
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}
