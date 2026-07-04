/**
 * Redux DevTools Debugging Utilities
 *
 * Helper functions for debugging RTK Query and Redux state in development.
 * All functions are no-op in production (__DEV__ guard).
 */

import { store } from './index';
import type { RootState } from './index';
import { logger } from '../utils/logger';

declare const __DEV__: boolean;

/**
 * Get the current Redux state (useful for debugging in browser console).
 *
 * Usage in browser console:
 * ```
 * getReduxState()
 * getReduxState().auth
 * getReduxState().chat.messages
 * ```
 */
export function getReduxState(): RootState {
  return store.getState();
}

/**
 * Get all cached API queries from RTK Query.
 *
 * Shows what's in the cache: pantry items, recipes, etc.
 */
export function getCachedQueries() {
  const state = store.getState();
  const apiState = (state as any).api;
  return apiState?.queries || {};
}

/**
 * Get all pending mutations.
 *
 * Useful to see what network operations are in flight.
 */
export function getPendingMutations() {
  const state = store.getState();
  const apiState = (state as any).api;
  return Object.entries(apiState?.mutations || {})
    .filter(([, mutation]: [string, any]) => mutation.status === 'pending')
    .map(([key, mutation]: [string, any]) => ({ key, ...(mutation as Record<string, any>) }));
}

/**
 * Get all pending queries.
 */
export function getPendingQueries() {
  const state = store.getState();
  const apiState = (state as any).api;
  return Object.entries(apiState?.queries || {})
    .filter(([, query]: [string, any]) => query.status === 'pending')
    .map(([key, query]: [string, any]) => ({ key, ...(query as Record<string, any>) }));
}

/**
 * Export current Redux state as JSON (for bug reports).
 */
export function exportReduxState(): string {
  return JSON.stringify(store.getState(), null, 2);
}

/**
 * Export pantry data specifically.
 */
export function exportPantryData() {
  const state = store.getState();
  const pantryCache = getCachedQueries();
  const pantryQuery = Object.entries(pantryCache)
    .find(([key]) => key.includes('getPantry'))?.[1];

  return {
    timestamp: new Date().toISOString(),
    pantryData: (pantryQuery as any)?.data,
    status: (pantryQuery as any)?.status,
  };
}

/**
 * Export chat history.
 */
export function exportChatHistory() {
  const state = store.getState();
  return {
    timestamp: new Date().toISOString(),
    messages: state.chat.messages,
    conversationId: state.chat.conversationId,
    isStreaming: state.chat.isStreaming,
    error: state.chat.error,
  };
}

/**
 * Export auth state.
 */
export function exportAuthState() {
  const state = store.getState();
  return {
    timestamp: new Date().toISOString(),
    isAuthenticated: state.auth.isAuthenticated,
    userId: state.auth.user?.id,
    userName: state.auth.user?.name,
    tokenExists: !!state.auth.token,
  };
}

/**
 * Log cache stats to console.
 *
 * Shows how many queries/mutations are cached.
 */
export function logCacheStats() {
  if (!__DEV__) return;

  const queries = getCachedQueries();
  const mutations = getPendingMutations();

  const queriesCount = Object.keys(queries).length;
  const pendingCount = mutations.length;

  logger.info('Cache', 'RTK Query cache stats', {
    totalCachedQueries: queriesCount,
    pendingMutations: pendingCount,
    timestamp: new Date().toISOString(),
  });

  console.table({
    'Cached Queries': queriesCount,
    'Pending Mutations': pendingCount,
    'Memory (approx)': `${JSON.stringify(queries).length / 1024}KB`,
  });
}

/**
 * Monitor RTK Query cache invalidation.
 *
 * Call this before and after an action to see cache changes.
 */
export function monitorCacheInvalidation() {
  if (!__DEV__) return;

  const beforeCache = JSON.stringify(getCachedQueries());

  return {
    checkChanges: () => {
      const afterCache = JSON.stringify(getCachedQueries());
      const changed = beforeCache !== afterCache;

      if (changed) {
        logger.info('Cache', 'Cache was invalidated', {
          before: beforeCache.length,
          after: afterCache.length,
        });
      } else {
        logger.debug('Cache', 'Cache unchanged');
      }

      return changed;
    },
  };
}

/**
 * Get API request statistics.
 *
 * Counts requests by status (fulfilled, rejected, pending).
 */
export function getAPIStats() {
  const queries = Object.values(getCachedQueries());
  const mutations = Object.values((store.getState() as any).api?.mutations || {});

  const stats = {
    queries: {
      total: queries.length,
      fulfilled: queries.filter((q: any) => q.status === 'fulfilled').length,
      pending: queries.filter((q: any) => q.status === 'pending').length,
      rejected: queries.filter((q: any) => q.status === 'rejected').length,
    },
    mutations: {
      total: mutations.length,
      fulfilled: mutations.filter((m: any) => m.status === 'fulfilled').length,
      pending: mutations.filter((m: any) => m.status === 'pending').length,
      rejected: mutations.filter((m: any) => m.status === 'rejected').length,
    },
  };

  return stats;
}

/**
 * Log API statistics to console.
 */
export function logAPIStats() {
  if (!__DEV__) return;

  const stats = getAPIStats();
  console.table(stats);
  logger.info('API', 'API request statistics', stats);
}

/**
 * Watch for cache changes in real-time.
 *
 * Usage:
 * ```
 * const watcher = watchCacheChanges();
 * // ... do something ...
 * watcher.stop();
 * ```
 */
export function watchCacheChanges() {
  if (!__DEV__) return { stop: () => {} };

  let lastCache = JSON.stringify(getCachedQueries());
  const interval = setInterval(() => {
    const currentCache = JSON.stringify(getCachedQueries());
    if (currentCache !== lastCache) {
      logger.info('Cache', 'Cache changed', {
        timeSinceLastChange: new Date().toISOString(),
      });
      lastCache = currentCache;
    }
  }, 1000);

  return {
    stop: () => clearInterval(interval),
  };
}

/**
 * Dump all debug info to console.
 *
 * Useful as a last resort for debugging.
 */
export function dumpAllDebugInfo() {
  if (!__DEV__) return;

  console.group('🔍 FoodBuddy Redux Debug Dump');

  console.group('Auth State');
  console.table(store.getState().auth);
  console.groupEnd();

  console.group('Chat State');
  console.log('Messages:', store.getState().chat.messages.length);
  console.log('Conversation ID:', store.getState().chat.conversationId);
  console.log('Is Streaming:', store.getState().chat.isStreaming);
  console.log('Error:', store.getState().chat.error);
  console.groupEnd();

  console.group('API Cache');
  logAPIStats();
  console.groupEnd();

  console.group('Pending Operations');
  const pending = getPendingMutations();
  if (pending.length > 0) {
    console.table(pending);
  } else {
    console.log('No pending mutations');
  }
  console.groupEnd();

  console.groupEnd();
}

// Expose to global scope in dev mode for easy console access
if (__DEV__ && typeof window !== 'undefined') {
  (window as any).__FOODBUDDY_DEBUG__ = {
    getReduxState,
    getCachedQueries,
    getPendingMutations,
    getPendingQueries,
    exportReduxState,
    exportPantryData,
    exportChatHistory,
    exportAuthState,
    logCacheStats,
    monitorCacheInvalidation,
    getAPIStats,
    logAPIStats,
    watchCacheChanges,
    dumpAllDebugInfo,
  };
}
