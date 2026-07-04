/**
 * Logger Utility
 *
 * Development-friendly logging with severity levels, timestamps, and grouping.
 * All logs are no-op in production (tree-shaken by bundler).
 */

declare const __DEV__: boolean;

const isDev = __DEV__; // React Native global

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs in memory

  private log(level: LogLevel, category: string, message: string, data?: unknown) {
    if (!isDev) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with color coding
    const color = this.getLevelColor(level);
    const prefix = `%c[${level}]%c [${category}]`;
    const styles = [`color: ${color}; font-weight: bold`, 'color: gray'];

    if (data !== undefined) {
      console.log(prefix, ...styles, message, data);
    } else {
      console.log(prefix, ...styles, message);
    }
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '#888888'; // Gray
      case LogLevel.INFO:
        return '#3FBF6F'; // Green
      case LogLevel.WARN:
        return '#F59E0B'; // Orange
      case LogLevel.ERROR:
        return '#EF4444'; // Red
    }
  }

  debug(category: string, message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: unknown) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: unknown) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: unknown) {
    this.log(LogLevel.ERROR, category, message, data);
  }

  /**
   * Get all logged entries (useful for debugging tools / crash reports).
   */
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    return this.logs.filter((log) => {
      if (level && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  /**
   * Clear all logs.
   */
  clear() {
    this.logs = [];
  }

  /**
   * Export logs as JSON (for sending to crash reporters, etc).
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
