package main

import (
	"log"

	"github.com/kubex-ecosystem/analyzer/internal/module"
)

// func getEnv(k, d string) string {
// 	if v := os.Getenv(k); v != "" {
// 		return v
// 	}
// 	return d
// }

func init() {
	// lê ou não lê o arquivo de configuração no init do main?
	// talvez seja melhor deixar para cada comando ler o arquivo de configuração

	// cfgPath := getEnv("PROVIDERS_CFG", "config/providers.yml")
	// _, err := registry.Load(cfgPath)
	// if err != nil {
	// 	log.Fatal(err)
	// }
}

func main() {
	if err := module.RegX().Command().Execute(); err != nil {
		log.Fatal(err)
	}
}
