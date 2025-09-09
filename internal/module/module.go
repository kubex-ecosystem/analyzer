// Package module provides internal types and functions for the GemxAnalyzer application.
package module

import (
	cc "github.com/kubex-ecosystem/gemx/analyzer/cmd/cli"
	gl "github.com/kubex-ecosystem/gemx/analyzer/internal/module/logger"
	vs "github.com/kubex-ecosystem/gemx/analyzer/internal/module/version"
	"github.com/spf13/cobra"

	"os"
	"strings"
)

type GemxAnalyzer struct {
	parentCmdName string
	PrintBanner   bool
}

func (m *GemxAnalyzer) Alias() string {
	return ""
}
func (m *GemxAnalyzer) ShortDescription() string {
	return "GemxAnalyzer a tool for building prompts with AI assistance."
}
func (m *GemxAnalyzer) LongDescription() string {
	return `GemxAnalyzer: A tool for building prompts with AI assistance using real engineering practices. Better prompts, better results.., Awesome prompts, AMAZING results !!!`
}
func (m *GemxAnalyzer) Usage() string {
	return "grompt [command] [args]"
}
func (m *GemxAnalyzer) Examples() []string {
	return []string{
		"grompt start",
		"grompt start -p 5000 -d '127.0.0.1'",
		"grompt ask --prompt \"What is Go?\" --provider gemini",
		"grompt generate --ideas \"API,REST,tutorial\" --purpose \"Learning\"",
		"grompt chat --provider claude",
	}
}
func (m *GemxAnalyzer) Active() bool {
	return true
}
func (m *GemxAnalyzer) Module() string {
	return "grompt"
}
func (m *GemxAnalyzer) Execute() error {
	return m.Command().Execute()
}
func (m *GemxAnalyzer) Command() *cobra.Command {
	gl.Log("debug", "Starting GemxAnalyzer CLI...")

	var rtCmd = &cobra.Command{
		Use:     m.Module(),
		Aliases: []string{m.Alias()},
		Example: m.concatenateExamples(),
		Version: vs.GetVersion(),
		Annotations: cc.GetDescriptions([]string{
			m.LongDescription(),
			m.ShortDescription(),
		}, m.PrintBanner),
	}

	rtCmd.AddCommand(cc.ServerCmdList()...)
	rtCmd.AddCommand(cc.SquadCmdList()...)
	rtCmd.AddCommand(cc.AICmdList()...)
	rtCmd.AddCommand(vs.CliCommand())

	// Set usage definitions for the command and its subcommands
	setUsageDefinition(rtCmd)
	for _, c := range rtCmd.Commands() {
		setUsageDefinition(c)
		if !strings.Contains(strings.Join(os.Args, " "), c.Use) {
			if c.Short == "" {
				c.Short = c.Annotations["description"]
			}
		}
	}

	return rtCmd
}
func (m *GemxAnalyzer) SetParentCmdName(rtCmd string) {
	m.parentCmdName = rtCmd
}
func (m *GemxAnalyzer) concatenateExamples() string {
	examples := ""
	rtCmd := m.parentCmdName
	if rtCmd != "" {
		rtCmd = rtCmd + " "
	}
	for _, example := range m.Examples() {
		examples += rtCmd + example + "\n  "
	}
	return examples
}
