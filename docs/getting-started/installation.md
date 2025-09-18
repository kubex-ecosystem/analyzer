# Instalação

Esta página fornece instruções detalhadas para instalar e configurar o GemxAnalyzer em diferentes plataformas.

## 📦 Opções de Instalação

### Opção 1: Download Binário (Recomendado)

A forma mais simples de instalar o GemxAnalyzer é baixando o binário pré-compilado para sua plataforma:

#### Linux (exemplo local)

```bash
make build-dev linux amd64
./dist/analyzer_linux_amd64 gateway serve --config ./config/config.example.yml
```

#### Windows/macOS

Baixe o binário correspondente em Releases. O nome segue o padrão `analyzer_<os>_<arch>`.

### Opção 2: Instalar via Make

```bash
git clone https://github.com/kubex-ecosystem/analyzer
cd analyzer
make build-dev linux amd64
```

Este comando compila um binário local em `dist/analyzer_linux_amd64`.

### Opção 3: Compilar do Código Fonte

#### Pré-requisitos

- **Go 1.25+** - [Instalar Go](https://golang.org/doc/install)
- **Node.js 18+** - [Instalar Node.js](https://nodejs.org/)
- **Make** - Disponível na maioria dos sistemas Unix

#### Passos de Compilação

```bash
# 1. Clonar o repositório
git clone https://github.com/kubex-ecosystem/analyzer.git
cd analyzer

# 2. Compilar
make build-dev linux amd64

# 3. Executar
./dist/analyzer_linux_amd64 version
```

#### Compilação para Outras Plataformas

```bash
# Compilar para Windows
make build-windows

# Compilar para Linux
make build-linux

# Compilar para macOS
make build-darwin

# Compilar para todas as plataformas
make build-all
```

## ⚙️ Configuração Inicial

### 1. Verificar Instalação

```bash
./dist/analyzer_linux_amd64 version
```

### 2. Configurar Variáveis de Ambiente (Opcional)

O GemxAnalyzer funciona em modo demo sem configuração, mas para usar provedores de IA externos, configure as chaves de API:

```bash
# Adicione ao seu ~/.bashrc, ~/.zshrc, ou ~/.profile

# OpenAI
export OPENAI_API_KEY="sk-..."

# Claude (Anthropic)
export CLAUDE_API_KEY="sk-ant-..."

# DeepSeek
export DEEPSEEK_API_KEY="..."

# Gemini
export GEMINI_API_KEY="..."

# Ollama (local)
export OLLAMA_ENDPOINT="http://localhost:11434"

# Configurações do servidor (opcional)
export PORT=8080
export DEBUG=false
```

### 3. Primeiro Teste

```bash
# Subir gateway (modo demo)
analyzer gateway serve --config ./config/config.example.yml
```

## 🔧 Configuração Avançada

### Configuração do Servidor

Por padrão, o GemxAnalyzer roda na porta 8080. Para alterar:

```bash
export PORT=3000
analyzer gateway serve --config ./config/config.example.yml
```

Ou diretamente:

```bash
analyzer gateway serve --port 3000
```

### Configuração de Debug

Para habilitação de logs detalhados:

```bash
export DEBUG=true
analyzer gateway serve
```

### Configuração para Ollama Local

Se você tem o Ollama instalado localmente:

```bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar um modelo
ollama pull llama2

# Configurar endpoint
export OLLAMA_ENDPOINT="http://localhost:11434"
export OLLAMA_MODEL="llama2"
```

## 🛠️ Solução de Problemas

### Problemas Comuns

#### "Permission denied" no Linux/macOS

```bash
chmod +x analyzer_linux_amd64
```

#### "analyzer: command not found"

Certifique-se que o binário está no PATH:

```bash
echo $PATH
which analyzer
```

#### Porta já em uso

```bash
# Verificar qual processo usa a porta
lsof -i :8080

# Usar porta diferente
analyzer gateway serve --port 8081
```

#### Problemas de Firewall

```bash
# Linux: permitir porta no firewall
sudo ufw allow 8080

# macOS: permitir no firewall do sistema
# Vá em System Preferences > Security & Privacy > Firewall
```

### Logs de Debug

```bash
DEBUG=true analyzer gateway serve
```

### Testar Conectividade

```bash
# Testar se o servidor está rodando
curl http://localhost:8080/healthz

# Testar providers/chat
curl -s -X POST localhost:8080/v1/chat -H 'Content-Type: application/json' -d '{"provider":"oai","model":"gpt-4o-mini","messages":[{"role":"user","content":"teste"}],"stream":false}' | jq
```

## 📋 Requisitos do Sistema

| Sistema | Requisitos Mínimos |
|---------|-------------------|
| **Memória RAM** | 100 MB |
| **Espaço em Disco** | 50 MB |
| **Processador** | x86_64 ou ARM64 |
| **Sistema Operacional** | Linux, macOS, Windows |
| **Rede** | Conectividade com internet (para provedores de IA externos) |

## 🔄 Atualizações

### Verificar Versão Atual

```bash
./dist/analyzer_linux_amd64 version
```

### Atualizar para Nova Versão

```bash
# Download manual (ajuste para seu OS/arch)
curl -L https://github.com/kubex-ecosystem/analyzer/releases/latest/download/analyzer_linux_amd64 -o analyzer-new
chmod +x analyzer-new
sudo mv analyzer-new /usr/local/bin/analyzer

# Ou recompilar do código
cd analyzer
git pull
make build-dev linux amd64
sudo cp dist/analyzer_linux_amd64 /usr/local/bin/analyzer
```

---

## 📚 Próximos Passos

- **[Início Rápido](quickstart.md)** - Primeiros passos com o GemxAnalyzer
- **[Comandos CLI](../user-guide/cli-commands.md)** - Referência completa dos comandos
- **[Configuração](../user-guide/configuration.md)** - Configuração detalhada dos provedores de IA
