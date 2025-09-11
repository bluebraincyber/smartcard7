import pool from '@/lib/db';
import logger from '@/lib/logger';

export interface AnalyticsEvent {
  storeid: string;
  event: 'visit' | 'whatsapp_click' | 'item_view' | 'item_add';
  data?: Record<string, unknown>;
  userAgent?: string;
  ipAddress?: string;
  requestId?: string; // Added for correlation
}

interface WhatsappClickData {
  type?: string;
}

interface ItemViewData {
  itemId?: string;
}

export async function trackEvent({
  storeid,
  event,
  data,
  userAgent,
  ipAddress,
  requestId // Recebe o requestId
}: AnalyticsEvent) {
  try {
    // Verificar se analytics está habilitado
    if (process.env.ANALYTICS_ENABLED !== 'true') {
      logger.debug('Analytics desabilitado, ignorando evento.', { storeid, event, requestId });
      return;
    }

    await pool.query(
      `INSERT INTO analytics (
        "storeid", event, data, "userAgent", ip, timestamp, "createdAt", "updatedAt"
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW(),
        NOW(),
        NOW()
      )`,
      [storeid, event, JSON.stringify(data || {}), userAgent || null, ipAddress || null]
    );
    logger.info('Evento de analytics registrado com sucesso.', { storeid, event, data, requestId });
  } catch (error) {
    logger.error('Erro ao registrar evento de analytics:', { 
      error: error instanceof Error ? error.message : String(error),
      storeid, 
      event, 
      requestId 
    });
  }
}

export async function getAnalyticsSummary(storeid: string) {
  try {
    logger.info('Buscando resumo de analytics para loja.', { storeid });
    // Total de visitas
    const totalsResult = await pool.query(
      `SELECT
        COUNT(CASE WHEN event = 'visit' THEN 1 END) as total_visits,
        COUNT(CASE WHEN event = 'whatsapp_click' THEN 1 END) as total_whatsapp_clicks
      FROM analytics 
      WHERE "storeid" = $1 
        AND timestamp >= $2`,
      [storeid, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()]
    );
    const totalVisits = parseInt(totalsResult.rows[0].total_visits);
    const totalWhatsAppClicks = parseInt(totalsResult.rows[0].total_whatsapp_clicks);

    // Taxa de conversão (cliques / visitas)
    const conversionRate = totalVisits > 0 ? (totalWhatsAppClicks / totalVisits) * 100 : 0;

    // Cliques por tipo
    const whatsappClicksResult = await pool.query(
      `SELECT data
      FROM analytics 
      WHERE "storeid" = $1 
        AND event = 'whatsapp_click' 
        AND timestamp >= $2`,
      [storeid, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()]
    );
    const whatsappClicks = whatsappClicksResult.rows;

    const clicksByType: Record<string, number> = {};
    whatsappClicks.forEach(click => {
      if (click.data) {
        const data = typeof click.data === 'string' ? JSON.parse(click.data) : click.data;
        const type = (data as WhatsappClickData).type || 'general';
        clicksByType[type] = (clicksByType[type] || 0) + 1;
      }
    });

    // Itens mais visualizados
    const itemViewsResult = await pool.query(
      `SELECT data
      FROM analytics 
      WHERE "storeid" = $1 
        AND event = 'item_view' 
        AND timestamp >= $2`,
      [storeid, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()]
    );
    const itemViews = itemViewsResult.rows;

    const itemViewCounts: Record<string, number> = {};
    itemViews.forEach(view => {
      if (view.data) {
        const data = typeof view.data === 'string' ? JSON.parse(view.data) : view.data;
        const itemId = (data as ItemViewData).itemId;
        if (itemId) {
          itemViewCounts[itemId] = (itemViewCounts[itemId] || 0) + 1;
        }
      }
    });

    // Visitas por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyAggregatesResult = await pool.query(
      `SELECT
        DATE_TRUNC('day', timestamp) as day,
        COUNT(CASE WHEN event = 'visit' THEN 1 END) as visits,
        COUNT(CASE WHEN event = 'whatsapp_click' THEN 1 END) as whatsapp_clicks
      FROM analytics
      WHERE "storeid" = $1
        AND timestamp >= $2
      GROUP BY day
      ORDER BY day ASC`,
      [storeid, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()]
    );

    const dailyAggregates = dailyAggregatesResult.rows.reduce<Record<string, { visits: number; whatsappClicks: number }>>((acc, row: any) => {
      const dateKey = new Date(row.day).toISOString().split('T')[0];
      acc[dateKey] = { visits: parseInt(row.visits), whatsappClicks: parseInt(row.whatsapp_clicks) };
      return acc;
    }, {});

    const dailyVisits = last7Days.map(date => ({
      date,
      visits: dailyAggregates[date]?.visits || 0,
      whatsappClicks: dailyAggregates[date]?.whatsappClicks || 0
    }));

    return {
      totalVisits,
      totalWhatsAppClicks,
      conversionRate: Math.round(conversionRate * 100) / 100,
      clicksByType,
      itemViewCounts,
      dailyVisits
    };
  } catch (error) {
    logger.error('Erro ao buscar analytics:', { 
      error: error instanceof Error ? error.message : String(error),
      storeid 
    });
    return {
      totalVisits: 0,
      totalWhatsAppClicks: 0,
      conversionRate: 0,
      clicksByType: {},
      itemViewCounts: {},
      dailyVisits: []
    };
  }
}

export async function getGlobalAnalyticsSummary(storeids: string[]) {
  try {
    logger.info('Buscando resumo de analytics global.', { storeids });

    if (storeids.length === 0) {
      return {
        totalStores: 0,
        totalVisits: 0,
        totalClicks: 0,
        activeStores: 0
      };
    }

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // Total de visitas
    const totalVisitsResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM analytics 
      WHERE "storeid" = ANY($1)
        AND event = 'visit' 
        AND timestamp >= $2`,
      [storeids, last30Days.toISOString()]
    );
    const totalVisits = parseInt(totalVisitsResult.rows[0].count);

    // Total de cliques
    const totalClicksResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM analytics 
      WHERE "storeid" = ANY($1)
        AND event = 'whatsapp_click' 
        AND timestamp >= $2`,
      [storeids, last30Days.toISOString()]
    );
    const totalClicks = parseInt(totalClicksResult.rows[0].count);

    // Lojas ativas (com pelo menos 1 clique na semana)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const activestoreidsResult = await pool.query(
      `SELECT DISTINCT "storeid"
      FROM analytics 
      WHERE "storeid" = ANY($1)
        AND event = 'whatsapp_click' 
        AND timestamp >= $2`,
      [storeids, lastWeek.toISOString()]
    );
    const activestoreids = activestoreidsResult.rows;

    return {
      totalStores: storeids.length,
      totalVisits,
      totalClicks,
      activeStores: activestoreids.length
    };
  } catch (error) {
    logger.error('Erro ao buscar analytics globais:', { 
      error: error instanceof Error ? error.message : String(error),
      storeids 
    });
    return {
      totalStores: 0,
      totalVisits: 0,
      totalClicks: 0,
      activeStores: 0
    };
  }
}
