#!/usr/bin/env bash

# faltando no EN
comm -23 i18n_used_keys.txt i18n_avail_en.txt   > i18n_missing_en.txt
# chaves “sobrando” no EN (não usadas)
comm -13 i18n_used_keys.txt i18n_avail_en.txt   > i18n_unused_en.txt

# faltando no PT-BR
comm -23 i18n_used_keys.txt i18n_avail_ptBR.txt > i18n_missing_ptBR.txt
# sobras no PT-BR
comm -13 i18n_used_keys.txt i18n_avail_ptBR.txt > i18n_unused_ptBR.txt

