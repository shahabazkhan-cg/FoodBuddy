# RTK Query + Redux DevTools Debugging Guide

## Setup

Redux DevTools is **already integrated** into your store. Just install the browser extension:

### Chrome
[Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmjabgkhbjedaepkggjblnlklplomlad)

### Firefox
[Redux DevTools Extension](https://addons.mozilla.org/firefox/addon/reduxdevtools/)

### Safari
Use [React Native Debugger](https://github.com/jhen0409/react-native-debugger) (has built-in Redux DevTools)

---

## What You'll See

Once installed and the app is running in development:

### RTK Query Requests
Every RTK Query call shows up as a Redux action:

```
[API] getPantry/fulfilled
├─ Action: {
│   type: "pantryApi/getPantry/fulfilled",
│   payload: {...}  // Full response
│   meta: {...}     // RTK metadata
├─ Previous State: {...}
├─ Next State: {...}
└─ Duration: 234ms
```

### API Logging Middleware Actions
Our custom logger dispatches debug actions:

```
[API] [GET] getPantry pending…
[API] [GET] getPantry ✓  (duration: 234ms)
```

### Chat (SSE Streaming)
Each streaming event appears as a separate action:

```
[Chat] Opening SSE stream…
[Chat] SSE event received {token: "butter"}
[Chat] SSE event received {token: " chicken"}
[Chat] Stream finalized
```

### Auth State Changes
```
[Auth] setCredentials
├─ Payload: {user, token}
└─ Next State: {isAuthenticated: true, token: "...", user: {...}}
```

---

## DevTools Features

### 1. **Action Inspector**
- Click any action to see its payload
- View before/after state diffs
- See request duration and response size

### 2. **Time-Travel Debugging**
- Use the slider to jump to any point in time
- All state at that moment is restored
- Great for reproducing bugs

### 3. **Action Replay**
- Click "Dispatch" button to replay an action
- Test state transitions without reloading
- Verify cache behavior

### 4. **State Tree View**
- Expand Redux state to see:
  - Current chat messages
  - Auth token status
  - API cache entries
  - Pantry items

### 5. **Diff Viewer**
- See exactly what changed in state
- Before/After comparison
- Shows `+added`, `-removed`, `~changed` fields

---

## Common Debugging Tasks

### Find API Cache Issues
1. Dispatch a query: `useGetPantryQuery()`
2. In DevTools, find action `pantryApi/getPantry/fulfilled`
3. Check `state.api.queries` → see cached data
4. Try cache invalidation: look for `pantryApi.util.invalidateTags`

### Debug SSE Stream Failures
1. Open chat and send a message
2. Watch actions appear in real-time:
   - `chat/addUserMessage`
   - `chat/startAssistantStream`
   - `chat/appendStreamToken` (repeats)
   - `chat/finalizeAssistantMessage` or `chat/setStreamError`
3. If stream stalls, check DevTools for error action

### Replay Auth Flow
1. Go to DevTools → Actions list
2. Find `auth/setCredentials` action
3. Scroll backward to see login steps
4. Click "Dispatch" to re-apply credentialsat any point
5. Verify UI responds correctly

### Inspect Large API Responses
1. Find the fulfilled action
2. Click "Payload" tab
3. Expand `response.payload.pantry_items`
4. See full item objects, categories, dates, etc.

### Check Cache Tags
1. Dispatch a query: `useGetPantryQuery()`
2. In DevTools state tree: `state.api`
3. Look for `queryCacheEntries` and `subscriptionCounts`
4. When you call a mutation like `addIngredient`, watch the cache update

---

## DevTools Actions Panel

### Buttons in DevTools:

| Button | Action |
|--------|--------|
| ▶️ | Play/resume action recording |
| ⏸️ | Pause action recording |
| 🔄 | Dispatch action (replay) |
| 🗑️ | Clear action history |
| 📤 | Export state as JSON |
| 📥 | Import state from JSON |
| ⏱️ | Time-travel to any action |
| 🔍 | Filter actions by type |

---

## RTK Query Specific

### Query Cache Structure
In DevTools state tree, look at `state.api.queries`:

```json
{
  "getPantry(undefined)": {
    "status": "fulfilled",
    "data": {...},
    "requestId": "...",
    "startedTimeStamp": 1234567890,
    "fulfilledTimeStamp": 1234567891
  }
}
```

### Mutation Status
Find pending mutations in `state.api.mutations`:

```json
{
  "addIngredient(undefined) #1": {
    "status": "pending",
    "requestId": "...",
    "startedTimeStamp": 1234567890
  }
}
```

---

## Best Practices

### 1. **Name Your Queries Meaningfully**
In the DevTools, you'll see queries like:
```
pantryApi/getPantry/fulfilled
recipesApi/getSuggestedRecipes/fulfilled
chatApi/sendMessage/fulfilled
```

The names come from your slice names (`pantryApi`, `recipesApi`) and endpoint names.

### 2. **Inspect Errors**
When a request fails:
```
[API] [GET] getPantry ✗
└─ error: "401 Unauthorized"
```
Check the action payload to see the full error.

### 3. **Monitor Cache Invalidation**
After mutations, watch for:
```
[API] [PATCH] updateIngredient ✓
     → Next action should be a cache invalidation
     → Check state.api.queries → old data should be cleared
```

### 4. **Check Memory Usage**
- DevTools shows all actions in memory
- The logger keeps 500 logs max (to avoid leaks)
- DevTools has its own circular buffer

---

## Exporting Logs for Bug Reports

### From Debug Console (📋 button):
1. Tap the 📋 debug button
2. Hit "Clear" to start fresh
3. Reproduce the bug
4. Copy logs (open DevTools → copy JSON export)

### From Redux DevTools:
1. Reproduce the bug
2. Click 📤 Export button in DevTools
3. Save the JSON file
4. Include in bug report

---

## Performance Monitoring

DevTools shows timing for every action:

```
[API] [GET] getPantry/fulfilled
Duration: 234ms
Response size: 12.5KB
```

Use this to:
- Spot slow requests
- Identify N+1 query problems
- Check cache hit rates

---

## Troubleshooting

### DevTools not showing actions?
- Ensure `__DEV__` is true
- Check Redux DevTools Extension is installed
- Reload the app/browser
- Check browser console for errors

### Too many actions (spam)?
- Use the filter box to search by action type
- Pause recording (⏸️ button)
- Clear history (🗑️ button)

### State looks wrong?
- Use time-travel slider to go back/forward
- Check if mutations invalidated cache
- Look for error actions

### Large payloads causing lag?
- DevTools might slow down if state is huge
- Check RTK Query cache isn't growing unbounded
- Verify subscriptions are cleaned up

---

## Keyboard Shortcuts (in DevTools)

- `Cmd/Ctrl + Shift + M` → Toggle DevTools
- `Cmd/Ctrl + H` → Show DevTools history
- `Cmd/Ctrl + Q` → Jump to action

---

## Next Steps

1. **Install the extension** (links above)
2. **Run the app**: `npm start`
3. **Open DevTools** (extension icon in browser toolbar)
4. **Trigger an action** (e.g., load PantryScreen)
5. **Watch it appear** in the DevTools action history
6. **Click to inspect** the full state and payload

Happy debugging! 🐛
