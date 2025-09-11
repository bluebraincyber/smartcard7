set -euo pipefail

echo "🔧 Padronizando pnpm + Node 20…"
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10 --activate

echo "🧹 Removendo lock do npm (se existir)…"
git rm --cached package-lock.json 2>/dev/null || true
rm -f package-lock.json || true

echo "📝 Garantindo engines/packageManager no package.json…"
node - <<'NODE'
const fs=require('fs');
const p=require('./package.json');
p.packageManager = p.packageManager || 'pnpm@10.0.0';
p.engines = p.engines || {};
p.engines.node = '>=20 <21';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
NODE

echo "📦 Instalando deps e gerando pnpm-lock.yaml…"
pnpm install

echo "📄 Escrevendo vercel.json v2 (mínimo)…"
cat > vercel.json <<'JSON'
{
  "version": 2,
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build"
}
JSON

echo "🧪 Smoke test local: build…"
pnpm build

echo "✅ Commitando alterações…"
git add package.json pnpm-lock.yaml vercel.json
git commit -m "chore(ci): standardize pnpm + Node20 and vercel.json v2 (fix deploy)" || true

echo "⬆️  Pushing…"
git push

echo "🎉 Pronto. Agora clique em Redeploy no Vercel (ou aguarde o deploy do push)."
