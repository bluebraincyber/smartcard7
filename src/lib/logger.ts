import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => { return { level: label }; },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`, // Formato ISO 8601
});

export function logRequest(req: NextRequest, res: NextResponse) {
  const requestId = req.headers.get('x-request-id') || uuidv4();
  res.headers.set('x-request-id', requestId);

  const log = logger.child({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
    ip: req.ip,
  });

  log.info('Request received');

  return log;
}

export default logger;