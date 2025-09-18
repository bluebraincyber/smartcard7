#!/bin/bash

# Configurações
DEFAULT_PORT=3000
PORT=${1:-$DEFAULT_PORT}
NODE_BIN="./node_modules/.bin/next"

# Função para matar processos na porta especificada
kill_process_on_port() {
    echo "🔍 Procurando por processos na porta $PORT..."
    
    # Encontra PIDs de processos na porta
    local pids=$(lsof -ti :$PORT -sTCP:LISTEN)
    
    if [ -n "$pids" ]; then
        echo "🛑 Encontrados processos na porta $PORT. Encerrando..."
        # Primeiro tenta encerrar de forma limpa
        echo "$pids" | xargs -r kill -15 2>/dev/null || true
        
        # Dá um tempo para os processos encerrarem
        sleep 2
        
        # Verifica se ainda há processos rodando
        local remaining_pids=$(lsof -ti :$PORT -sTCP:LISTEN)
        if [ -n "$remaining_pids" ]; then
            echo "⚠️  Forçando encerramento dos processos restantes..."
            echo "$remaining_pids" | xargs -r kill -9 2>/dev/null || true
            sleep 1
        fi
        
        # Verificação final
        if lsof -ti :$PORT -sTCP:LISTEN >/dev/null; then
            echo "❌ Não foi possível encerrar todos os processos na porta $PORT"
            return 1
        else
            echo "✅ Porta $PORT liberada com sucesso"
            return 0
        fi
    else
        echo "✅ Nenhum processo encontrado na porta $PORT"
        return 0
    fi
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verifica se o lsof está instalado
if ! command_exists lsof; then
    echo "❌ Erro: O comando 'lsof' não está instalado."
    echo "   Instale com: sudo apt-get install lsof"
    exit 1
fi

# Verifica se o Node.js está instalado
if ! command_exists node; then
    echo "❌ Erro: Node.js não está instalado."
    echo "   Instale o Node.js em: https://nodejs.org/"
    exit 1
fi

# Verifica se o binário do Next.js existe
if [ ! -f "$NODE_BIN" ]; then
    echo "❌ Erro: Binário do Next.js não encontrado em $NODE_BIN"
    echo "   Execute 'pnpm install' para instalar as dependências"
    exit 1
fi

# Tenta liberar a porta
if ! kill_process_on_port; then
    echo "\n💡 Dicas para resolver manualmente:"
    echo "1. Verifique processos na porta: lsof -i :$PORT"
    echo "2. Encerre processos manualmente: kill -9 <PID>"
    echo "3. Ou mude a porta editando a variável PORT neste script"
    exit 1
fi

# Exporta variáveis de ambiente
export NODE_ENV=development

echo "🚀 Iniciando o servidor de desenvolvimento na porta $PORT..."
echo "📂 Usando o binário: $NODE_BIN"

# Executa o servidor Next.js com exec para substituir o processo atual
exec "$NODE_BIN" dev -p $PORT
