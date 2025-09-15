# MODO CIRÚRGICO — CONTRATO DE MUDANÇA (Trae)

## Princípios
- Escopo fechado e dif mínimo.
- Ambiente fixo: Node 20.18.0 + pnpm 9.x.
- Sem alterações em dependências/configs sem autorização explícita.

## O que PODE editar (respeitando allowlist.json)
- Componentes/UI locais
- Páginas/app routes específicas listadas na solicitação
- Texto/UX copy
- Testes associados ao arquivo alterado

## O que NÃO PODE (respeitando denylist.json)
- `package.json`, `pnpm-lock.yaml`, `.npmrc`, `.nvmrc`
- `tsconfig.json`, `next.config.*`, `.eslintrc*`, `vitest.*`, `vercel.*`
- Pastas `sql/`, `scripts/` (salvo autorização explícita)
- Qualquer rename de arquivo, mudança de caminho ou de **casing** de import

## Entregáveis obrigatórios
1) **Plano (bullets)**: quais linhas/arquivos, por quê.  
2) **Diff unificado** apenas dos arquivos permitidos.  
3) **QA (resumo textual)**: `pnpm lint`, `pnpm type-check`, `pnpm build`.  
4) **Impacto + rollback** (1 commit para reverter).

## Regras extras
- Se precisar tocar arquivo fora da allowlist, **PARE** e peça autorização.
- Não executar “organize imports” global.
- Não alterar props/types públicas sem PR dedicado.

## Formato de solicitação (copie no prompt do Trae)
Objetivo: <mudança pontual>  
Arquivos permitidos: <lista de paths>  
Use este contrato e respeite `allowlist.json` / `denylist.json`.  
Entregue: Plano → Diff → QA → Impacto/rollback.  
