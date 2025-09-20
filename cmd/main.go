package main

import (
	gl "github.com/kubex-ecosystem/analyzer/internal/module/logger"

	"github.com/kubex-ecosystem/analyzer/internal/module"
)

func main() {
	if err := module.RegX().Command().Execute(); err != nil {
		gl.Log("fatal", err.Error())
	}
}
