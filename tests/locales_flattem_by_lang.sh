#!/usr/bin/env bash


# EN
> i18n_avail_en.txt
for f in locales/en/*.json; do
  ns=$(basename "$f" .json)
  jq -r 'paths(scalars) | join(".")' "$f" | sed "s/^/$ns./" >> i18n_avail_en.txt
done
sort -u -o i18n_avail_en.txt i18n_avail_en.txt

# PT-BR
> i18n_avail_ptBR.txt
for f in locales/pt-BR/*.json; do
  ns=$(basename "$f" .json)
  jq -r 'paths(scalars) | join(".")' "$f" | sed "s/^/$ns./" >> i18n_avail_ptBR.txt
done
sort -u -o i18n_avail_ptBR.txt i18n_avail_ptBR.txt
