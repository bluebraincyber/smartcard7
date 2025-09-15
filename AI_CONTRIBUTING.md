# AI_CONTRIBUTING – Contrato de Mudança para Agentes (Trae/Claude)

Este repositório opera em **modo cirúrgico**. O agente **NÃO** tem autonomia para refatorações fora de escopo.

## Princípios
1. **Escopo fechado:** edite **apenas** os arquivos explicitamente listados na solicitação.
2. **Dif mínimo:** mudanças estritamente necessárias para cumprir o objetivo.
3. **Ambiente fixo:** Node 20.x, pnpm 9.x. Não altere versões, configs ou dependências sem ordem expressa.

## Proibições
- ❌ Adicionar/atualizar/remover **dependências**.
- ❌ Alterar **nomes de arquivos**, **caminhos** ou **casing** de imports.
- ❌ Modificar `tsconfig.json`, `next.config.*`, `.eslintrc*`, `vercel.*`, `postcss.config.*`, `tailwind.config.*`.
- ❌ Rodar “organize imports” global ou refatorações oportunistas.
- ❌ Criar/editar mais de **N** arquivos sem autorização (N padrão: **2**).

## Saídas Obrigatórias do Agente
1. **Plano de mudança (bullets)** – explique o que será editado e por quê.
2. **Patch em diff unificado** (`git diff`) **somente** dos arquivos autorizados.
3. **Resultados de QA local (resumo textual):**
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm build`
4. **Impacto/risco + plano de rollback** (como reverter em 1 commit).

## Política de Qualidade (gates)
- O patch **só é aceito** se `pnpm validate` passar localmente.
- Regressões de casing/imports são **bloqueio P0**.
- Mudança de API pública (props/types) exige PR separado com aprovação humana prévia.

## Como Pedir Mudanças (Template)
> **Objetivo:** [descreva a alteração pontual]  
> **Arquivos permitidos:** `[path/arquivo1]`, `[path/arquivo2]`  
> **Restrições:** ver seções *Proibições* e *Saídas Obrigatórias*.  
> **Não toque em:** configs, dependências, nomes/caminhos de arquivos, imports globais.  
> **Entrega:** Plano → Diff → QA → Impacto/rollback.

## Checklist do Revisor
- [ ] Mudou **apenas** arquivos listados
- [ ] Sem alterações em deps/config
- [ ] Imports e **casing** intactos
- [ ] `pnpm validate` OK
- [ ] Diff pequeno e legível
- [ ] Rollback simples descrito

## Observações de Plataforma
- **Next.js 14 (App Router):** respeitar fronteira Server/Client. Não transformar componentes sem explicitar o motivo.
- **Tailwind v4:** não reescrever tokens/utilitários fora do escopo.
- **shadcn/ui (se usado):** manter `class-variance-authority`, `tailwind-merge`, `tailwindcss-animate` instalados. Não mover variações (`cva`) entre arquivos.

---

### Prompt de Uso (cole no Trae a cada tarefa)

**MODO CIRÚRGICO – CHANGE CONTRACT**

Objetivo: \<descrever alteração pontual\>  
Arquivos permitidos: \<lista de paths\>  

**Restrições**
- Não adicionar/alterar dependências.
- Não tocar em `tsconfig`, `next.config.*`, ESLint, Vercel ou `postcss/tailwind`.
- Não alterar nomes/caminhos/casing de imports.
- Não executar refatorações fora do escopo.

**Entrega**
1) Plano (bullets)  
2) `git diff` apenas dos arquivos permitidos  
3) Saída resumida de `pnpm lint`, `pnpm type-check`, `pnpm build`  
4) Impacto esperado + rollback

**Qualidade**
- Se qualquer etapa de QA falhar, **NÃO** finalize. Refaça mantendo o escopo.  
- Se for necessário tocar em outro arquivo, **pare** e solicite autorização.
