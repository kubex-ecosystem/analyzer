// Package module provides internal types and functions for the Analyzer application.
package module

import (
	cc "github.com/kubex-ecosystem/analyzer/cmd/cli"
	gl "github.com/kubex-ecosystem/analyzer/internal/module/logger"
	vs "github.com/kubex-ecosystem/analyzer/internal/module/version"
	"github.com/spf13/cobra"

	"os"
	"strings"
)

type Analyzer struct {
	parentCmdName string
	PrintBanner   bool
}

func (m *Analyzer) Alias() string {
	return ""
}
func (m *Analyzer) ShortDescription() string {
	return "AI tools help in the editor, but they stop antes do PR, lacking governance."
}
func (m *Analyzer) LongDescription() string {
	return `Analyzer: An AI-powered tool that enhances code quality and governance by providing intelligent suggestions and reviews before pull requests. It integrates seamlessly into your development workflow, ensuring that your code meets the highest standards of quality and compliance.`
}
func (m *Analyzer) Usage() string {
	return "Analyzer [command] [args]"
}
func (m *Analyzer) Examples() []string {
	return []string{
		"analyzer gateway serve -p '8080' -b '127.0.0.1' -f './config.yaml'",
		"analyzer gui web -f './config.yaml'",
	}
}
func (m *Analyzer) Active() bool {
	return true
}
func (m *Analyzer) Module() string {
	return "Analyzer"
}
func (m *Analyzer) Execute() error {
	return m.Command().Execute()
}
func (m *Analyzer) Command() *cobra.Command {
	gl.Log("debug", "Starting Analyzer CLI...")

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

	// Add subcommands to the root command
	rtCmd.AddCommand(cc.GatewayCmds())
	rtCmd.AddCommand(cc.NewDaemonCommand())

	// Add more commands as needed
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
func (m *Analyzer) SetParentCmdName(rtCmd string) {
	m.parentCmdName = rtCmd
}
func (m *Analyzer) concatenateExamples() string {
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
