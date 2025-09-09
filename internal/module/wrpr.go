package module

import (
	"os"
	"strings"
)

func RegX() *GemxAnalyzer {
	var printBannerV = os.Getenv("GROMPT_PRINT_BANNER")
	if printBannerV == "" {
		printBannerV = "true"
	}

	return &GemxAnalyzer{
		PrintBanner: strings.ToLower(printBannerV) == "true",
	}
}
