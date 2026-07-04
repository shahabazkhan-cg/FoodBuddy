/**
 * Network Request Interceptor
 *
 * Globally intercepts all fetch requests and responses for logging and debugging.
 * Tracks timing, status codes, and provides detailed network diagnostics.
 */

import { logger } from './logger';

declare const __DEV__: boolean;

interface InterceptedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  startTime: number;
  responseTime?: number;
  status?: number;
  responseSize?: number;
  error?: string;
}

// Store recent requests for debugging
const requestHistory: InterceptedRequest[] = [];
const MAX_HISTORY = 100;

/**
 * Extract safe body for logging (truncate large payloads)
 */
function getSafeBody(body: unknown, maxLength = 200): unknown {
  if (!body) return undefined;

  if (typeof body === 'string') {
    if (body.length > maxLength) {
      try {
        const parsed = JSON.parse(body);
        return {
          ...parsed,
          _truncated: true,
          _length: body.length,
        };
      } catch {
        return body.slice(0, maxLength) + '...';
      }
    }
    return body;
  }

  return body;
}

/**
 * Extract safe headers for logging (hide sensitive data)
 */
function getSafeHeaders(headers: Record<string, string> | undefined): Record<string, string> {
  if (!headers) return {};

  const safe: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    // Hide sensitive headers
    if (lowerKey.includes('authorization') || lowerKey.includes('token') || lowerKey.includes('cookie')) {
      safe[key] = '***REDACTED***';
    } else if (typeof value === 'string' && value.length > 100) {
      safe[key] = value.slice(0, 100) + '...';
    } else {
      safe[key] = value;
    }
  }

  return safe;
}

/**
 * Extract domain from URL for cleaner logging
 */
function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url;
  }
}

/**
 * Initialize the network interceptor
 * Call this in App.tsx to enable global request logging
 */
export function initNetworkInterceptor() {
  if (!__DEV__) return;

  // In React Native, globalThis is available
  // @ts-ignore - globalThis might not be typed
  const globalScope = globalThis;
  const originalFetch = globalScope.fetch;

  if (!originalFetch) {
    logger.warn('Network', 'Could not initialize interceptor: fetch not available');
    return;
  }

  // @ts-ignore - Override global fetch
  globalScope.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const url = typeof input === 'string' ? input : input.toString();
    const method = (init?.method || 'GET').toUpperCase();
    const domain = getDomain(url);

    // Skip logging for SSE endpoints to avoid interfering with streaming
    const isSSE = url.includes('/chat/sse') || url.includes('/sse');

    const request: InterceptedRequest = {
      id: requestId,
      url,
      method,
      headers: getSafeHeaders(init?.headers as Record<string, string> | undefined),
      body: getSafeBody(init?.body),
      startTime: Date.now(),
    };

    // Log request (skip verbose logging for SSE)
    if (!isSSE) {
      logger.debug('Network', `[${method}] ${domain}`, {
        requestId,
        url,
        headers: request.headers,
        body: request.body,
      });
    }

    try {
      // Call original fetch - pass all parameters including signal for proper cleanup
      const response = await originalFetch.call(this, input as any, init);

      // Calculate timing
      const responseTime = Date.now() - request.startTime;
      request.responseTime = responseTime;
      request.status = response.status;

      // Try to get response size from Content-Length header
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        request.responseSize = parseInt(contentLength, 10);
      }

      // Log response (skip verbose logging for SSE)
      if (!isSSE) {
        logger.info('Network', `[${method}] ${domain} → ${response.status} (${responseTime}ms)`, {
          requestId,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          responseSize: request.responseSize,
          contentType: response.headers.get('content-type'),
        });
      }

      // Add to history
      addToHistory(request);

      return response;
    } catch (error) {
      // Calculate timing on error
      const responseTime = Date.now() - request.startTime;
      request.responseTime = responseTime;
      request.error = error instanceof Error ? error.message : String(error);

      // Log error (always log errors, including SSE)
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Network', `[${method}] ${domain} ✗ ${errorMessage}`, {
        requestId,
        error: request.error,
        responseTime,
        errorName: error instanceof Error ? error.name : 'Unknown',
        url,
      });

      // Add to history
      addToHistory(request);

      // Re-throw error for caller to handle
      throw error;
    }
  };

  logger.debug('Network', 'Network interceptor initialized');
}

/**
 * Add request to history, maintaining max size
 */
function addToHistory(request: InterceptedRequest) {
  requestHistory.push(request);

  if (requestHistory.length > MAX_HISTORY) {
    requestHistory.shift();
  }
}

/**
 * Get full request history
 */
export function getNetworkHistory(): InterceptedRequest[] {
  return [...requestHistory];
}

/**
 * Get recent requests (last N)
 */
export function getRecentRequests(count = 10): InterceptedRequest[] {
  return requestHistory.slice(-count);
}

/**
 * Filter requests by status
 */
export function getFailedRequests(): InterceptedRequest[] {
  return requestHistory.filter((r) => r.error || (r.status && r.status >= 400));
}

/**
 * Get network statistics
 */
export function getNetworkStats() {
  const total = requestHistory.length;
  const successful = requestHistory.filter((r) => r.status && r.status < 400).length;
  const failed = requestHistory.filter((r) => r.error || (r.status && r.status >= 400)).length;
  const avgResponseTime =
    requestHistory.length > 0
      ? requestHistory.reduce((sum, r) => sum + (r.responseTime || 0), 0) / requestHistory.length
      : 0;

  const byMethod: Record<string, number> = {};
  const byDomain: Record<string, number> = {};

  for (const req of requestHistory) {
    byMethod[req.method] = (byMethod[req.method] || 0) + 1;
    const domain = getDomain(req.url);
    byDomain[domain] = (byDomain[domain] || 0) + 1;
  }

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? ((successful / total) * 100).toFixed(1) + '%' : 'N/A',
    avgResponseTime: avgResponseTime.toFixed(0) + 'ms',
    requestsByMethod: byMethod,
    requestsByDomain: byDomain,
    histogram: getResponseTimeHistogram(),
  };
}

/**
 * Get response time histogram for performance analysis
 */
function getResponseTimeHistogram() {
  const buckets = {
    '0-100ms': 0,
    '100-500ms': 0,
    '500-1s': 0,
    '1s+': 0,
  };

  for (const req of requestHistory) {
    if (!req.responseTime) continue;

    if (req.responseTime < 100) buckets['0-100ms']++;
    else if (req.responseTime < 500) buckets['100-500ms']++;
    else if (req.responseTime < 1000) buckets['500-1s']++;
    else buckets['1s+']++;
  }

  return buckets;
}

/**
 * Clear request history
 */
export function clearNetworkHistory() {
  requestHistory.length = 0;
  logger.debug('Network', 'Request history cleared');
}

/**
 * Export network debugging to global scope
 */
declare global {
  interface Window {
    __FOODBUDDY_DEBUG__?: Record<string, unknown>;
  }
}

if (__DEV__ && typeof window !== 'undefined') {
  window.__FOODBUDDY_DEBUG__ = window.__FOODBUDDY_DEBUG__ || {};
  Object.assign(window.__FOODBUDDY_DEBUG__, {
    getNetworkHistory,
    getRecentRequests,
    getFailedRequests,
    getNetworkStats,
    clearNetworkHistory,
  });
}
