/**
 * Logger Usage Guide
 *
 * This file documents how to use the logging system across the FoodBuddy app.
 * All logging is automatically tree-shaken in production builds.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BASIC USAGE
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from './utils/logger';

// Simple log messages
logger.debug('MyComponent', 'Debug info here');
logger.info('MyComponent', 'Something important happened');
logger.warn('MyComponent', 'Warning about something');
logger.error('MyComponent', 'An error occurred');

// Log with data
logger.info('Pantry', 'Items loaded', {
  count: 5,
  categories: ['DAIRY', 'PRODUCE'],
});

// ─────────────────────────────────────────────────────────────────────────────
// IN SCREENS & COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { logger } from '../utils/logger';

export function MyScreen() {
  useEffect(() => {
    logger.info('MyScreen', 'Screen mounted');
    return () => logger.info('MyScreen', 'Screen unmounted');
  }, []);

  const handlePress = () => {
    logger.debug('MyScreen', 'Button pressed', { action: 'edit' });
  };

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// IN CUSTOM HOOKS
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { logger } from '../utils/logger';

export function useMyHook() {
  const action = useCallback(() => {
    logger.debug('useMyHook', 'Action triggered', { timestamp: Date.now() });
  }, []);

  return { action };
}

// ─────────────────────────────────────────────────────────────────────────────
// IN API / DATA LAYER
// ─────────────────────────────────────────────────────────────────────────────

// RTK Query automatically logs:
// - All pending/fulfilled/rejected lifecycle events
// - Request method, URL, and duration
// - Response size and error details

// For manual API calls:
import { logger } from '../utils/logger';

async function fetchCustomData() {
  try {
    logger.debug('API', 'Fetching custom data…');
    const response = await fetch('/endpoint');
    logger.info('API', 'Custom fetch succeeded', {
      status: response.status,
    });
  } catch (err) {
    logger.error('API', 'Custom fetch failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SSE STREAMING (Chat)
// ─────────────────────────────────────────────────────────────────────────────

// useChatStream automatically logs:
// - Message sent event
// - SSE stream opened/closed events
// - Each token received
// - Errors and user cancellation
// - No manual logging needed!

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSING LOGS PROGRAMMATICALLY
// ─────────────────────────────────────────────────────────────────────────────

import { logger, LogLevel } from '../utils/logger';

// Get all logs
const allLogs = logger.getLogs();

// Filter by level
const errors = logger.getLogs(LogLevel.ERROR);

// Filter by category
const apiLogs = logger.getLogs(undefined, 'API');

// Export logs as JSON (for crash reports, bug reports)
const jsonString = logger.export();
console.log(jsonString); // Send to a logging service

// Clear logs (useful before testing a specific flow)
logger.clear();

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG CONSOLE (UI)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In development, a floating debug button (📋) appears on all screens.
 *
 * Tap it to open the Debug Console modal where you can:
 * - View real-time logs with color-coded severity
 * - Filter by category or log level
 * - Search by keyword
 * - Clear logs
 *
 * The console displays:
 * - Timestamp (time only)
 * - Log level with color
 * - Category
 * - Message
 * - Data (if any) in JSON
 */

// ─────────────────────────────────────────────────────────────────────────────
// BEST PRACTICES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. USE CATEGORIES
 *    Keep categories consistent: 'API', 'Chat', 'Auth', 'Pantry', 'UI'
 *    Makes filtering in the debug console easier.
 *
 * 2. LOG AT THE RIGHT LEVEL
 *    - debug: low-level details (token counts, parsing steps)
 *    - info: state changes, milestones (logged in, stream started)
 *    - warn: potential issues (retry attempts, rate limits)
 *    - error: failures that broke the flow
 *
 * 3. INCLUDE CONTEXT
 *    Don't: logger.error('Auth', 'Login failed')
 *    Do:    logger.error('Auth', 'Login failed', {
 *             reason: error.message,
 *             endpoint: '/auth/login',
 *             userEmail: email,
 *           })
 *
 * 4. AVOID LOGGING SENSITIVE DATA
 *    Don't log passwords, tokens, or personally identifiable info.
 *
 * 5. KEEP IT TERSE
 *    Messages are shown in the debug console with limited space.
 *    Opt for emoji or abbreviations if helpful: '✓', '✗', '→', '←'
 */
