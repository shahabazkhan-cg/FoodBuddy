# User Selection Feature - Implementation Guide

## Summary
Added a user selection dropdown to LoginScreen that allows selecting between 6 users. The selected user ID is automatically included in every chat message sent to the backend, though not visible to the user (hidden).

## Files Modified

### 1. `src/store/slices/authSlice.ts`
**Changes:**
- Added `userId: string | null` to `AuthState` interface
- Added `setUserId` action to set the selected user ID
- Updated initial state to include `userId: null`
- Exported `setUserId` action

```typescript
// Usage: dispatch(setUserId("user_chandra"))
```

### 2. `src/screens/auth/LoginScreen.tsx`
**Changes:**
- Added user selection dropdown UI component on LoginScreen
- Imported `ChevronDown` icon from lucide-react-native for visual feedback
- Added 6 predefined users with IDs:

| User | ID |
|------|-----|
| Chandra | `user_chandra` |
| Pasha | `user_pasha` |
| Thakur | `user_thakur` |
| Roshan | `user_roshan` |
| Shahbaz | `user_shahbaz` |
| Hemanth | `user_hemanth` |

**Features:**
- Dropdown button displays selected user name
- Chevron icon rotates when dropdown is open/closed
- Custom dropdown menu with all 6 users
- Selected user is highlighted with primary color
- Default selection: Chandra
- Click outside or select to close dropdown
- Added comprehensive styling for the dropdown component

### 3. `src/hooks/useChatStream.ts`
**Changes:**
- Added `userId` selector: `const userId = useAppSelector((state) => state.auth.userId);`
- Updated request body to include user ID:
  ```json
  {
    "user_input": "message text",
    "conversationId": "...",
    "userId": "user_selected_id"
  }
  ```
- Added `userId` to useCallback dependency array

## How It Works

### User Flow
1. App opens → LoginScreen displays
2. User sees dropdown (defaulted to "Chandra")
3. User can click dropdown to select another user
4. Selection is saved to Redux state (`auth.userId`)
5. When user sends a chat message:
   - Hook reads `userId` from Redux
   - User ID is automatically added to request body
   - Backend receives message with `userId` field

### Backend Request Example
```json
{
  "user_input": "give me butter chicken recipe",
  "conversationId": "conv_abc123xyz",
  "userId": "user_chandra"
}
```

## Backend Integration

Your backend SSE endpoint (`/chat/sse`) will now receive an additional `userId` field in the request body. You can use this to:

- **Personalization**: Tailor responses based on user preferences
- **Analytics**: Track which user is making which requests
- **User History**: Store conversation history per user
- **Preferences**: Remember user-specific settings (dietary restrictions, cooking style, etc.)

## Example Backend Usage

```python
# Flask example
@app.route('/chat/sse', methods=['POST'])
def chat_sse():
    data = request.json
    user_id = data.get('userId')  # e.g., "user_chandra"
    user_input = data.get('user_input')
    conversation_id = data.get('conversationId')
    
    # Use user_id to personalize responses
    # ... your SSE streaming logic
```

## Testing

1. **Open the app** - LoginScreen shows with user dropdown
2. **Select a different user** - Verify dropdown opens/closes and selection changes
3. **Send a chat message** - Backend will receive the selected user ID (check server logs)
4. **Switch users** - Select another user and send another message to verify ID changes

## Notes

- User selection is **persistent** across the session (stored in Redux)
- User ID is sent with **every message** automatically
- No UI display of the user ID in the chat messages (it's "hidden")
- Default user is "Chandra" when the app starts
- User IDs follow the format: `user_{firstname_lowercase}`
