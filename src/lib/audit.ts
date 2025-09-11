import { pool } from './db';
import logger from './logger';

interface AuditEvent {
  actorId: string; // ID do usuário que realizou a ação
  entityType: string; // Tipo da entidade (ex: 'Product', 'User', 'Order')
  entityId: string; // ID da entidade afetada
  action: string; // Ação realizada (ex: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
  details?: Record<string, any>; // Detalhes adicionais, como o diff da mudança
  requestId?: string; // ID da requisição para correlação
}

export async function recordAuditEvent({
  actorId,
  entityType,
  entityId,
  action,
  details,
  requestId,
}: AuditEvent) {
  try {
    const query = `
      INSERT INTO audit_logs (
        actor_id,
        entity_type,
        entity_id,
        action,
        details,
        request_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      actorId,
      entityType,
      entityId,
      action,
      details ? JSON.stringify(details) : null,
      requestId || null,
    ];
    await pool.query(query, values);
    logger.info('Audit event recorded', { actorId, entityType, entityId, action, requestId });
  } catch (error) {
    logger.error('Failed to record audit event', { error, actorId, entityType, entityId, action, requestId });
  }
}

// Exemplo de uso:
/*
// Em um Server Action ou API Route:
import { recordAuditEvent } from '@/lib/audit';
import { headers } from 'next/headers';

async function updateProduct(productId: string, newData: any, userId: string) {
  const requestId = headers().get('x-request-id') || 'unknown';
  // ... lógica para atualizar o produto ...

  await recordAuditEvent({
    actorId: userId,
    entityType: 'Product',
    entityId: productId,
    action: 'UPDATE',
    details: { oldData: {}, newData: {} }, // Adicione o diff real aqui
    requestId,
  });
}
*/