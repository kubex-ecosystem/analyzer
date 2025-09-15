// Package analyzer provides functionality for the Analyzer application.
package analyzer

import (
	_ "embed"
)

//go:embed all:embedded/guiweb
var guiWeb string

// GUIAnalyzer analyzes GUI-related metrics and provides insights
type GUIAnalyzer struct {
	// Add fields as necessary for the analyzer's stateExport
}
