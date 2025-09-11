# Métricas e Observabilidade - Smartcard7

## Visão Geral

Este documento define a estratégia de monitoramento e observabilidade do Smartcard7, incluindo métricas de aplicação, performance, negócio e alertas críticos. O objetivo é manter visibilidade completa sobre a saúde do sistema e identificar problemas antes que afetem os usuários.

## Stack de Observabilidade

### Ferramentas Implementadas
- **Pino**: Logs estruturados com correlação por request ID
- **PostgreSQL Stats**: Métricas nativas do banco de dados
- **Next.js Analytics**: Web Vitals e performance do frontend

### Ferramentas Recomendadas (Roadmap)
- **Sentry**: Captura e análise de erros
- **Vercel Analytics**: Métricas de performance e Web Vitals
- **Prometheus + Grafana**: Métricas customizadas e dashboards
- **Uptime Robot**: Monitoramento de disponibilidade

## Métricas de API

### Throughput (Requisições por Minuto)
```sql
-- Query para análise de throughput por endpoint
SELECT 
    DATE_TRUNC('minute', created_at) as minute,
    COUNT(*) as requests,
    AVG(response_time_ms) as avg_response_time
FROM request_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute DESC;
```

**Endpoints críticos para monitoramento:**
- `GET /api/stores/{id}` - Página pública da loja
- `POST /api/items` - Criação de itens
- `POST /api/upload` - Upload de imagens
- `GET /api/health/db` - Health check

### Latência (p95/p99)
```typescript
// middleware.ts - Instrumentação de latência
import { logger } from '@/lib/logger';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  return NextResponse.next().then(response => {
    const duration = Date.now() - start;
    
    logger.info('api_request', {
      method: request.method,
      url: request.url,
      status: response.status,
      duration_ms: duration,
      request_id: response.headers.get('x-request-id'),
    });

    // Alertar para requests muito lentos
    if (duration > 5000) {
      logger.warn('slow_request', {
        url: request.url,
        duration_ms: duration,
      });
    }

    return response;
  });
}
```

**SLOs (Service Level Objectives):**
- p95 < 500ms para endpoints de leitura
- p95 < 1000ms para endpoints de escrita
- p99 < 2000ms para todos os endpoints

### Taxa de Erro
```sql
-- Análise de erros por endpoint e código
SELECT 
    SPLIT_PART(url, '?', 1) as endpoint,
    status_code,
    COUNT(*) as error_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as error_percentage
FROM request_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
    AND status_code >= 400
GROUP BY endpoint, status_code
ORDER BY error_count DESC;
```

**Alertas de Taxa de Erro:**
- Taxa de erro 4xx > 5% em 15 minutos
- Taxa de erro 5xx > 1% em 5 minutos
- Qualquer erro 5xx em endpoints críticos

## Métricas de Banco de Dados

### Performance de Queries
```sql
-- Top queries mais lentas (requer pg_stat_statements)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    stddev_time
FROM pg_stat_statements 
WHERE mean_time > 100  -- Queries com média > 100ms
ORDER BY mean_time DESC
LIMIT 10;
```

### Conexões e Locks
```sql
-- Monitoramento de conexões ativas
SELECT 
    state,
    COUNT(*) as connection_count,
    MAX(NOW() - state_change) as oldest_connection_age
FROM pg_stat_activity 
WHERE state IS NOT NULL
GROUP BY state;

-- Detecção de locks longos
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_or_recent_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted AND blocking_locks.granted;
```

### Tamanho e Crescimento
```sql
-- Monitoramento do crescimento do banco
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Análise de crescimento diário
WITH daily_growth AS (
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_records
    FROM items 
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
)
SELECT 
    date,
    new_records,
    AVG(new_records) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg
FROM daily_growth
ORDER BY date DESC;
```

## Métricas de Negócio

### KPIs Principais
```sql
-- Dashboard executivo diário
WITH daily_metrics AS (
    SELECT 
        CURRENT_DATE as date,
        COUNT(DISTINCT s.id) as total_stores,
        COUNT(DISTINCT s.id) FILTER (WHERE s.created_at::date = CURRENT_DATE) as new_stores_today,
        COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT i.id) FILTER (WHERE i.created_at::date = CURRENT_DATE) as new_items_today,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT u.id) FILTER (WHERE u.created_at::date = CURRENT_DATE) as new_users_today
    FROM users u
    LEFT JOIN stores s ON u.id = s.userid
    LEFT JOIN items i ON s.id = i.storeid
)
SELECT * FROM daily_metrics;
```

### Métricas de Engajamento
```sql
-- Análise de atividade por loja
SELECT 
    s.name as store_name,
    s.slug,
    COUNT(i.id) as total_items,
    COUNT(i.id) FILTER (WHERE i.isactive = true) as active_items,
    COUNT(i.id) FILTER (WHERE i.isfeatured = true) as featured_items,
    MAX(i.updated_at) as last_item_update,
    CASE 
        WHEN MAX(i.updated_at) >