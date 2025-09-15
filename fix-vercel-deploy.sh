#!/bin/bash

echo "🔧 Corrigindo deploy do SmartCard7 no Vercel..."

# 1. Remover lockfile antigo
echo "🗑️  Removendo pnpm-lock.yaml desatualizado..."
rm -f pnpm-lock.yaml

# 2. Limpar cache do pnpm
echo "🧹 Limpando cache do pnpm..."
pnpm store prune

# 3. Reinstalar todas as dependências
echo "📦 Reinstalando dependências com versions corretas..."
pnpm install

# 4. Verificar se não há conflitos
echo "🔍 Verificando conflitos..."
pnpm audit --audit-level high

# 5. Testar build localmente
echo "🏗️  Testando build local..."
pnpm build

echo "✅ Build local concluído! Agora faça o commit:"
echo ""
echo "git add pnpm-lock.yaml"
echo "git commit -m 'fix: regenerate pnpm-lock.yaml for vercel compatibility'"
echo "git push origin main"
echo ""
echo "🚀 Deploy no Vercel deve funcionar após o push!"
