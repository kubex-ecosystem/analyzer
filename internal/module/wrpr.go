package module

import (
	"os"
	"strings"
)

func RegX() *Analyzer {
	var printBannerV = os.Getenv("GROMPT_PRINT_BANNER")
	if printBannerV == "" {
		printBannerV = "true"
	}

	return &Analyzer{
		PrintBanner: strings.ToLower(printBannerV) == "true",
	}
}
