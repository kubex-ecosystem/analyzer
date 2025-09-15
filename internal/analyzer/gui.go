// Package analyzer provides functionality for the Analyzer application.
package analyzer

import (
	"embed"
)

//go:embed all:embedded/guiweb
var GuiWebFS embed.FS

// GUIAnalyzer analyzes GUI-related metrics and provides insights
type GUIAnalyzer struct {
	// Add fields as necessary for the analyzer's stateExport
}
