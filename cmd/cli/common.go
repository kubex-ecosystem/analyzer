// Package cli provides common functionality for command-line interface applications.
package cli

import (
	"fmt"
	"math/rand"
	"os"
	"strings"
)

var banners = []string{
	`
                                        %sGemX%s
      __      ____  _____      __      _____    ____  ____ ________ _________ _______
     /  \    |_   \|_   _|    /  \    |_   _|  |_  _||_  _|  __   _|_   ___  |_   __ \
    / /\ \     |   \ | |     / /\ \     | |      \ \  / / |_/  / /   | |_  \_| | |__) |
   / ____ \    | |\ \| |    / ____ \    | |   _   \ \/ /     .'.' _  |  _|  _  |  __ /
 _/ /    \ \_ _| |_\   |_ _/ /    \ \_ _| |__/ |  _|  |_   _/ /__/ |_| |___/ |_| |  \ \_
|____|  |____|_____|\____|____|  |____|________| |______| |________|_________|____| |___|
`,
}

func GetDescriptions(descriptionArg []string, _ bool) map[string]string {
	var description, banner string

	if descriptionArg != nil {
		if strings.Contains(strings.Join(os.Args[0:], ""), "-h") {
			description = descriptionArg[0]
		} else {
			description = descriptionArg[1]
		}
	} else {
		description = ""
	}

	bannerRandLen := len(banners)
	bannerRandIndex := rand.Intn(bannerRandLen)
	banner = fmt.Sprintf(banners[bannerRandIndex], "", "\033[0m")

	return map[string]string{"banner": banner, "description": description}
}
