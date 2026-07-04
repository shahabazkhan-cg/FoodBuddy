/**
 * RTK Query Logging Middleware
 *
 * Intercepts all API requests and responses to log them for debugging.
 * Automatically includes:
 * - Request method, URL, headers, body
 * - Response status, duration
 * - Errors and retries
 */

import type { Middleware } from '@reduxjs/toolkit';
import { logger } from '../../utils/logger';

export const apiLoggingMiddleware: Middleware = () => (next) => (action: unknown) => {
  // Log RTK Query lifecycle events
  const type = (action as any)?.type as string;

  // Pending request
  if (type?.includes('/pending')) {
    const match = type.match(/(\w+)\/(\w+)\/pending/);
    if (match) {
      const [, endpointName, methodName] = match;
      logger.debug('API', `[${methodName}] ${endpointName} pending…`, {
        endpoint: endpointName,
        method: methodName,
      });
    }
  }

  // Fulfilled request
  if (type?.includes('/fulfilled')) {
    const match = type.match(/(\w+)\/(\w+)\/fulfilled/);
    if (match) {
      const [, endpointName, methodName] = match;
      const payload = (action as any)?.payload;
      logger.info('API', `[${methodName}] ${endpointName} ✓`, {
        endpoint: endpointName,
        method: methodName,
        status: 'success',
        dataSize: JSON.stringify(payload).length,
      });
    }
  }

  // Rejected request
  if (type?.includes('/rejected')) {
    const match = type.match(/(\w+)\/(\w+)\/rejected/);
    if (match) {
      const [, endpointName, methodName] = match;
      const error = (action as any)?.payload;
      logger.error('API', `[${methodName}] ${endpointName} ✗`, {
        endpoint: endpointName,
        method: methodName,
        error: error?.message || error?.status || 'Unknown error',
      });
    }
  }

  return next(action);
};
