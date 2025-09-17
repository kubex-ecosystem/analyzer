#!/usr/bin/env bash

# ajuste ./src se precisar
rg -no --pcre2 "t\(\s*['\"\$(]([A-Za-z][\w-]+)\.([A-Za-z0-9_.-]+)['\")]\s*(?:,|\))" ./frontend/src \
| awk -F: '{print $3}' \
| sed -E "s/^t\(['\"\`]//; s/['\"\`].*$//" \
| sort -u > i18n_used_keys.txt
