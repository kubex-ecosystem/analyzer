#!/bin/bash

# --- CONFIGURAÇÕES ---
# Altere as variáveis abaixo conforme sua necessidade.

# O diretório principal onde a busca e substituição devem começar.
# Use "." para o diretório atual ou um caminho completo.
DIRETORIO_RAIZ="/srv/apps/LIFE/KUBEX/gemx-analyzer"

# O texto antigo a ser procurado (ex: caminho de importação do Go).
TEXTO_ANTIGO="github.com/kubex-ecosystem/gemx-analyzer"

# O novo texto que substituirá o antigo.
TEXTO_NOVO="github.com/kubex-ecosystem/analyzer"

# Lista de tipos de arquivo para verificar.
# Adicione ou remova padrões de nome de arquivo conforme necessário,
# mantendo o formato: -o -name "NOVO_PADRAO"
# Exemplos: "*.go", "*.json", "*.mod", "*.sum", "*.yml", "*.yaml", "*.md", "Dockerfile"
PADROES_DE_ARQUIVO=( -name "*.go" -o -name "*.json" -o -name "*.mod" -o -name "*.sum" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "Dockerfile" )


# --- SCRIPT ---
# (Não precisa alterar nada daqui para baixo)

# Cores para facilitar a leitura da saída
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
NC='\033[0m' # Sem Cor

echo -e "${VERDE}Iniciando a substituição de referências nos arquivos do projeto em: $(realpath "$DIRETORIO_RAIZ")${NC}"
echo "Procurando por '${AMARELO}$TEXTO_ANTIGO${NC}' para substituir por '${VERDE}$TEXTO_NOVO${NC}'."
echo -e "${AMARELO}IMPORTANTE: O diretório .git e seu conteúdo serão ignorados.${NC}"
echo "------------------------------------------------------------------"

# O comando 'find' procura por arquivos que correspondam aos padrões definidos,
# mas usa '-prune' para explicitamente pular (não entrar) em qualquer diretório chamado ".git".
# O uso de 'print0' e 'read -d' garante que nomes de arquivo com espaços sejam tratados corretamente.
find "$DIRETORIO_RAIZ" -type d -name ".git" -prune -o -type f \( "${PADROES_DE_ARQUIVO[@]}" \) -print0 | while IFS= read -r -d '' file; do

    # Verifica se o arquivo contém o texto antigo antes de tentar substituí-lo.
    # Usamos 'grep -qF' para uma busca rápida e literal da string.
    if grep -qF "$TEXTO_ANTIGO" "$file"; then
        echo -e "${AMARELO}Referência encontrada em:${NC} $file"

        # Substitui todas as ocorrências no arquivo.
        # O uso de '|' como delimitador no sed é para evitar conflitos com as '/' no texto.
        sed -i "s|${TEXTO_ANTIGO}|${TEXTO_NOVO}|g" "$file"

        echo -e "  -> ${VERDE}Arquivo atualizado com sucesso.${NC}"
    fi
done

echo "------------------------------------------------------------------"
echo -e "${VERDE}Processo concluído!${NC}"
