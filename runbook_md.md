# Runbook Operacional - Smartcard7

## Configuração de Ambiente

### Pré-requisitos
- **Node.js**: 18.17.0 ou superior
- **pnpm**: 8.0.0 ou superior (recomendado)
- **PostgreSQL**: 13+ ou superior
- **Git**: 2.30+ ou superior

### Verificação Rápida do Sistema
```bash
# Verificar versões dos pré-requisitos
node --version    # v18.17.0+
pnpm --version    # 8.0.0+
psql --version    # PostgreSQL 13+
git --version     # 2.30+

# Verificar conectividade com banco
psql $POSTGRES_URL -c "SELECT version();"
```

## Setup Local (Desenvolvimento)

### 1. Clone e Instalação
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/smartcard7.git
cd smartcard7

# Instalar dependências
pnpm install

# Verificar integridade do projeto
pnpm run type-check
pnpm run lint
```

### 2. Configuração de Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar variáveis essenciais
nano .env.local
```

**Variáveis obrigatórias para desenvolvimento:**
```bash
# Database
POSTGRES_URL="postgresql://user:password@localhost:5432/smartcard7_dev"
DATABASE_URL="postgresql://user:password@localhost:5432/smartcard7_dev"
DIRECT_URL="postgresql://user:password@localhost:5432/smartcard7_dev"

# NextAuth
NEXTAUTH_SECRET="desenvolvimento-secret-key-super-longa"
NEXTAUTH_URL="http://localhost:3000"

# Upload (local)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"  # 5MB

# Desenvolvimento
NODE_ENV="development"
```

### 3. Setup do Banco de Dados
```bash
# Criar banco de desenvolvimento
createdb smartcard7_dev

# Executar migrations em ordem
psql $POSTGRES_URL -f sql/01_tables.sql
psql $POSTGRES_URL -f sql/02_indexes.sql
psql $POSTGRES_URL -f sql/03_triggers.sql
psql $POSTGRES_URL -f sql/04_add_missing_columns.sql

# Inserir dados de seed (opcional)
psql $POSTGRES_URL -f sql/99_seed.sql

# Verificar se tabelas foram criadas
psql $POSTGRES_URL -c "\dt"
```

### 4. Primeira Execução
```bash
# Rodar aplicação em modo desenvolvimento
pnpm run dev

# Em outro terminal, verificar se API está funcionando
curl http://localhost:3000/api/health/db

# Acessar aplicação
open http://localhost:3000
```

## Comandos de Desenvolvimento

### Scripts Disponíveis
```bash
# Desenvolvimento
pnpm run dev          # Inicia servidor de desenvolvimento
pnpm run dev:debug    # Inicia com debug habilitado

# Build e produção
pnpm run build        # Compila aplicação para produção
pnpm run start        # Inicia servidor de produção
pnpm run preview      # Visualiza build de produção

# Qualidade de código
pnpm run lint         # Executa ESLint
pnpm run lint:fix     # Corrige problemas automáticos
pnpm run type-check   # Verifica tipos TypeScript
pnpm run format       # Formata código com Prettier

# Testes
pnpm run test         # Executa testes unitários
pnpm run test:watch   # Executa testes em modo watch
pnpm run test:coverage # Gera relatório de cobertura
pnpm run e2e          # Executa testes E2E
pnpm run e2e:headed   # Executa E2E com interface visual

# Database
pnpm run db:migrate   # Executa migrations pendentes
pnpm run db:seed      # Insere dados de seed
pnpm run db:reset     # Reset completo do banco
```

### Debugging
```bash
# Debug do Next.js
DEBUG=* pnpm run dev

# Debug apenas do banco de dados
DEBUG=pg:* pnpm run dev

# Debug com Node Inspector
node --inspect node_modules/.bin/next dev
```

## Deploy em Produção

### Vercel (Recomendado)

#### Setup Inicial
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login e configuração inicial
vercel login
vercel link

# Configurar variáveis de ambiente
vercel env add POSTGRES_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy inicial
vercel --prod
```

#### Deploy Automático via Git
```bash
# Configure no dashboard da Vercel:
# 1. Connect Git Repository
# 2. Configure Environment Variables
# 3. Enable automatic deployments

# Deploy manual se necessário
git push origin main  # Deploy automático
# ou
vercel --prod         # Deploy manual
```

### Deploy Manual (VPS/Container)

#### Preparação do Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 para gerenciamento de processos
npm install -g pm2

# Instalar e configurar PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --createdb smartcard7
sudo -u postgres createdb smartcard7_prod
```

#### Build e Deploy
```bash
# No servidor, clonar código
git clone https://github.com/seu-usuario/smartcard7.git
cd smartcard7

# Instalar dependências de produção
NODE_ENV=production pnpm install --frozen-lockfile

# Configurar variáveis de ambiente
cp .env.example .env.production
nano .env.production  # Editar com valores de produção

# Executar migrations
psql $POSTGRES_URL -f sql/01_tables.sql
psql $POSTGRES_URL -f sql/02_indexes.sql

# Build da aplicação
pnpm run build

# Configurar PM2
cp ecosystem.config.js.example ecosystem.config.js
nano ecosystem.config.js  # Ajustar configurações

# Iniciar aplicação
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Configuração do PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'smartcard7',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/smartcard7',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/smartcard7/error.log',
    out_file: '/var/log/smartcard7/out.log',
    log_file: '/var/log/smartcard7/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

## Operações de Banco de Dados

### Migrations
```bash
# Aplicar nova migration
psql $POSTGRES_URL -f sql/05_new_migration.sql

# Verificar status das tabelas
psql $POSTGRES_URL -c "
  SELECT schemaname, tablename, 
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables 
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Verificar índices em uso
psql $POSTGRES_URL -c "
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
"
```

### Backup e Restore
```bash
# Backup completo
pg_dump $POSTGRES_URL > "backup-$(date +%Y%m%d_%H%M%S).sql"

# Backup apenas schema
pg_dump --schema-only $POSTGRES_URL > "schema-$(date +%Y%m%d).sql"

# Backup apenas dados
pg_dump --data-only $POSTGRES_URL > "data-$(date +%Y%m%d).sql"

# Restore
psql $POSTGRES_URL < backup-20240101_120000.sql

# Restore específico de tabela
psql $POSTGRES_URL -c "\copy items FROM 'items_backup.csv' CSV HEADER"
```

### Monitoramento de Performance
```bash
# Verificar conexões ativas
psql $POSTGRES_URL -c "
  SELECT count(*) as connections, state
  FROM pg_stat_activity
  GROUP BY state;
"

# Queries mais lentas
psql $POSTGRES_URL -c "
  SELECT query, mean_time, calls, total_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"

# Tamanho do banco
psql $POSTGRES_URL -c "
  SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
"
```

## Monitoramento e Saúde

### Health Checks
```bash
# Verificar saúde da aplicação
curl http://localhost:3000/api/health/db

# Verificar tempo de resposta
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/

# Arquivo curl-format.txt:
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#           time_total:  %{time_total}\n
```

### Logs
```bash
# Logs do PM2
pm2 logs smartcard7
pm2 logs smartcard7 --lines 100

# Logs do sistema (se usando systemd)
journalctl -u smartcard7 -f

# Análise de logs de erro
grep "ERROR" /var/log/smartcard7/error.log | tail -20

# Contagem de erros por hora
grep "ERROR" /var/log/smartcard7/error.log | \
  awk '{print $1" "$2}' | \
  cut -d: -f1-2 | \
  sort | uniq -c
```

### Métricas Importantes
```bash
# CPU e memória da aplicação
pm2 show smartcard7

# Uso de disco
df -h /var/log/smartcard7
du -sh /public/uploads

# Conexões de rede
netstat -tulpn | grep :3000

# Processos relacionados
ps aux | grep node
```

## Procedimentos de Emergência

### Rollback Rápido

#### Vercel
```bash
# Listar deployments recentes
vercel ls

# Fazer rollback para deployment anterior
vercel rollback [deployment-url]

# Ou promover deployment específico
vercel promote [deployment-url] --scope production
```

#### Deploy Manual
```bash
# Parar aplicação
pm2 stop smartcard7

# Voltar para commit anterior
git reset --hard HEAD~1

# Rebuild se necessário
pnpm run build

# Reiniciar aplicação
pm2 start smartcard7
```

### Restauração de Banco
```bash
# CUIDADO: Procedimento destrutivo!

# 1. Fazer backup do estado atual
pg_dump $POSTGRES_URL > "emergency-backup-$(date +%Y%m%d_%H%M%S).sql"

# 2. Parar aplicação
pm2 stop smartcard7

# 3. Dropar e recriar banco
dropdb smartcard7_prod
createdb smartcard7_prod

# 4. Restaurar do backup
psql $POSTGRES_URL < backup-last-known-good.sql

# 5. Verificar integridade
psql $POSTGRES_URL -c "SELECT count(*) FROM users;"
psql $POSTGRES_URL -c "SELECT count(*) FROM stores;"

# 6. Reiniciar aplicação
pm2 start smartcard7
```

### Hotfix Crítico
```bash
# 1. Criar branch de hotfix
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Aplicar correção mínima
# ... fazer alterações necessárias ...

# 3. Testar localmente
pnpm run test
pnpm run e2e

# 4. Build de produção
pnpm run build

# 5. Deploy imediato
git add .
git commit -m "hotfix: critical security vulnerability"
git push origin hotfix/critical-security-fix

# Deploy via Vercel
vercel --prod

# Ou deploy manual
pm2 stop smartcard7
git pull origin hotfix/critical-security-fix
pnpm run build
pm2 start smartcard7

# 6. Merge para main
git checkout main
git merge hotfix/critical-security-fix
git push origin main
```

## Troubleshooting Comum

### Problema: Aplicação não inicia
```bash
# Verificar logs
pm2 logs smartcard7 --lines 50

# Verificar variáveis de ambiente
pm2 show smartcard7 | grep env

# Verificar porta
lsof -i :3000

# Reiniciar processo
pm2 restart smartcard7
```

### Problema: Erro de conexão com banco
```bash
# Testar conectividade
psql $POSTGRES_URL -c "SELECT 1;"

# Verificar conexões ativas
psql $POSTGRES_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Reiniciar PostgreSQL (se necessário)
sudo systemctl restart postgresql
```

### Problema: Upload de imagens falha
```bash
# Verificar permissões
ls -la public/uploads/
chmod 755 public/uploads/

# Verificar espaço em disco
df -h /

# Verificar logs de upload
grep "upload" /var/log/smartcard7/combined.log
```

### Problema: Performance lenta
```bash
# Verificar CPU e memória
top -p $(pgrep -f smartcard7)

# Verificar queries lentas no banco
psql $POSTGRES_URL -c "
  SELECT query, mean_time, calls
  FROM pg_stat_statements
  WHERE mean_time > 1000
  ORDER BY mean_time DESC
  LIMIT 5;
"

# Verificar cache do Next.js
ls -la .next/cache/

# Limpar cache se necessário
rm -rf .next/cache/
pnpm run build
pm2 restart smartcard7
```

## Manutenção Preventiva

### Tarefas Diárias
```bash
#!/bin/bash
# daily-maintenance.sh

# Verificar saúde da aplicação
curl -f http://localhost:3000/api/health/db || echo "ALERT: Health check failed"

# Verificar espaço em disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
  echo "ALERT: Disk usage is ${DISK_USAGE}%"
fi

# Verificar logs de erro
ERROR_COUNT=$(grep -c "ERROR" /var/log/smartcard7/error.log | tail -24h)
if [ $ERROR_COUNT -gt 100 ]; then
  echo "ALERT: ${ERROR_COUNT} errors in the last 24h"
fi
```

### Tarefas Semanais
```bash
#!/bin/bash
# weekly-maintenance.sh

# Backup do banco de dados
pg_dump $POSTGRES_URL > "/backups/weekly-$(date +%Y%m%d).sql"

# Limpeza de logs antigos
find /var/log/smartcard7 -name "*.log" -mtime +7 -delete

# Limpeza de uploads órfãos
# (implementar script para verificar arquivos sem referência no banco)

# Atualização de dependências de segurança
npm audit --audit-level high
```

### Tarefas Mensais
```bash
#!/bin/bash
# monthly-maintenance.sh

# Análise de performance do banco
psql $POSTGRES_URL -c "ANALYZE;"

# Reindex se necessário
psql $POSTGRES_URL -c "REINDEX DATABASE smartcard7_prod;"

# Verificar tamanho das tabelas
psql $POSTGRES_URL -f scripts/analyze-db-size.sql

# Rotação de secrets (se aplicável)
# Gerar novo NEXTAUTH_SECRET e agendar rotação
```

## Contatos de Emergência

### Escalação de Incidentes
1. **Desenvolvedor Principal**: dev@smartcard7.com
2. **DevOps**: devops@smartcard7.com
3. **CTO**: cto@smartcard7.com

### Serviços Externos
- **Vercel Support**: https://vercel.com/help
- **PostgreSQL DBA**: dba@smartcard7.com
- **Provedor de Cloud**: support@provider.com

### Documentação Adicional
- **API Reference**: `/docs/API-INDEX.md`
- **Database Schema**: `/docs/DB-SCHEMA.sql`
- **Security Guidelines**: `/docs/SECURITY.md`
- **Testing Strategy**: `/docs/TESTS.md`

---

**Última atualização**: Janeiro 2024
**Versão**: 1.0
**Próxima revisão**: Abril 2024