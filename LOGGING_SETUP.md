# Logging System - Quick Start

## What's included

A complete logging system for debugging the FoodBuddy React Native app:

### 1. **Logger Utility** (`src/utils/logger.ts`)
- Four log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`
- Color-coded console output
- Circular buffer (keeps last 500 logs)
- Works only in development (tree-shaken in production)

### 2. **RTK Query Middleware** (`src/store/middleware/loggingMiddleware.ts`)
- Automatically logs all API requests/responses
- Tracks pending → fulfilled/rejected lifecycle
- Shows response size and duration
- No setup needed—already wired into the store

### 3. **SSE Chat Logging** (`src/hooks/useChatStream.ts`)
- Logs every stream event
- Tracks conversation ID, tokens received, errors
- User cancellation logged as info (not error)

### 4. **Debug Console UI** (`src/components/DebugConsole.tsx`)
- Floating 📋 button on all dev screens (tap to open)
- Real-time log viewer with filtering
- Search by keyword, filter by level/category
- Export logs as JSON for crash reports

### 5. **App Integration** (`App.tsx`)
- Debug console visible only in `__DEV__` mode
- Automatically mounted in root provider hierarchy

---

## Usage Examples

### Basic logging in a component
```tsx
import { logger } from '../utils/logger';

export function MyComponent() {
  useEffect(() => {
    logger.info('MyComponent', 'Component mounted');
  }, []);
  
  const handleAction = () => {
    logger.debug('MyComponent', 'Button pressed', { action: 'edit' });
  };
  
  return <Pressable onPress={handleAction}>Tap me</Pressable>;
}
```

### Logging in a hook
```tsx
import { logger } from '../utils/logger';

export function useMyData() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    logger.info('useMyData', 'Fetching data…');
    fetchData()
      .then(result => {
        logger.info('useMyData', 'Fetch succeeded', { count: result.length });
        setData(result);
      })
      .catch(err => {
        logger.error('useMyData', 'Fetch failed', { error: err.message });
      });
  }, []);
  
  return data;
}
```

### API call logging (automatic via RTK Query)
```
[INFO] API [GET] getPantry ✓
       ↳ endpoint: "getPantry", method: "GET", status: "success", duration: 234ms
```

### SSE stream logging (automatic via useChatStream)
```
[INFO]  Chat  Opening SSE stream to https://chatbot-...
[DEBUG] Chat  SSE stream opened: 200
[DEBUG] Chat  SSE event received {conversationId: "xxx"}
[DEBUG] Chat  SSE event received {token: "Here"}
[DEBUG] Chat  SSE event received {token: " is"}
[INFO]  Chat  Server signaled done
```

---

## Debug Console Features

**Tap the 📋 button to:**
- View real-time logs with timestamps
- Filter by level (All / DEBUG / INFO / WARN / ERROR)
- Filter by category (API, Chat, MyComponent, etc)
- Search by keyword in message or category
- Clear all logs
- See log count and data size

---

## Categories (convention)

Use consistent categories for easy filtering:
- `API` — RTK Query requests/responses
- `Chat` — SSE streaming events
- `Auth` — Login/logout flow
- `Pantry` — Pantry screen/operations
- `Recipes` — Recipe recommendations
- `UI` — Component rendering

---

## Accessing logs programmatically

```tsx
import { logger, LogLevel } from '../utils/logger';

// Get all logs
const all = logger.getLogs();

// Get only errors
const errors = logger.getLogs(LogLevel.ERROR);

// Get API logs
const apiLogs = logger.getLogs(undefined, 'API');

// Export as JSON (for crash reporters)
const json = logger.export();
console.log(json);

// Clear logs
logger.clear();
```

---

## Best Practices

✅ **DO:**
- Use meaningful categories (API, Chat, Auth)
- Include contextual data: `{ count, duration, error }`
- Log state transitions (mounted, loading, success, error)
- Use the right level: debug for details, info for milestones, warn for issues, error for failures

❌ **DON'T:**
- Log sensitive data (passwords, tokens, emails)
- Create ad-hoc categories each time
- Log on every re-render (causes spam)
- Use `console.log` instead of the logger (won't show in debug console)

---

## Production

In production builds:
- `__DEV__` is `false`
- All logging is tree-shaken by bundler (zero overhead)
- Debug console is never rendered
- Safe to ship with logging code as-is
