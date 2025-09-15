#!/bin/bash

# Script para corrigir dependências do SmartCard7
# Resolve o erro: pnpm-lock.yaml is not up to date with package.json

echo "🔧 Corrigindo dependências do SmartCard7..."

# Remove lockfile e node_modules
echo "🗑️  Limpando cache de dependências..."
rm -rf node_modules pnpm-lock.yaml

# Reinstala dependências
echo "📦 Reinstalando dependências..."
pnpm install

# Verifica se deu certo
echo "✅ Verificando integridade..."
pnpm audit

echo "🎉 Dependências corrigidas! Agora faça o commit:"
echo "git add pnpm-lock.yaml"
echo "git commit -m 'fix: update pnpm-lock.yaml to match package.json'"
echo "git push"
