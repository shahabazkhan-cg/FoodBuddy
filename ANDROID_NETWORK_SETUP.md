# Android Network Configuration & SSE Debugging Guide

## What Was Added

### 1. Network Security Configuration
**File**: `android/app/src/main/res/xml/network_security_config.xml`

This file configures Android's network security policy to allow HTTPS traffic to your Azure backend. It:
- Allows HTTPS to `chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net`
- Trusts system certificate authorities (standard HTTPS)
- Disables cleartext (HTTP) traffic for security

### 2. AndroidManifest.xml Update
Added `android:networkSecurityConfig="@xml/network_security_config"` to the `<application>` tag to reference the security config.

## Debugging the "Network request failed" Error

The error you're seeing could be caused by several things:

### ✅ Already Configured
- ✅ `android.permission.INTERNET` permission (already present)
- ✅ Network security config for HTTPS domain (just added)
- ✅ HTTPS certificate validation (trusts system CAs)

### 🔍 Things to Check

**1. Network Connectivity**
```typescript
// Check if device has internet connection
import { useNetInfo } from '@react-native-community/netinfo';

const netInfo = useNetInfo();
console.log('Is connected:', netInfo.isConnected); // Should be true
```

**2. SSL Certificate Issues**
- The Azure certificate should be trusted by default
- If you're getting SSL errors, check that the domain's certificate is valid
- Test in browser: `https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/`

**3. Timeout Issues**
React Native's default fetch timeout is very short. Increase it in your SSE hook:

```typescript
// In useChatStream.ts
fetchEventSource(`${API_BASE_URL}/chat/sse`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ user_input: content, conversationId }),
  timeout: 30000, // Increase timeout to 30 seconds
  onopen: () => {
    logger.info('Chat', 'SSE stream opened');
  },
  // ... rest of config
});
```

**4. CORS Headers (Server-side)**
Ensure your Azure backend returns these headers for SSE:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Cache-Control: no-cache
Connection: keep-alive
Content-Type: text/event-stream
```

**5. Test with Logcat**
Monitor Android logs during network calls:
```bash
# Watch device logs in real-time
adb logcat | grep -E "okhttp|Network|SSL|Fetch"

# Or filter for your app
adb logcat | grep "FoodBuddy"
```

**6. Verify SSE Endpoint**
Test the endpoint directly:
```bash
# Using curl with proper headers
curl -X POST https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/chat/sse \
  -H "Content-Type: application/json" \
  -d '{"user_input":"Test","conversationId":null}'

# Should return event stream, not errors
```

## iOS Configuration (for reference)

iOS requires similar network security setup in `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
      <false/>
      <key>NSExceptionRequiresForwardSecrecy</key>
      <false/>
    </dict>
  </dict>
</dict>
```

## Next Steps

1. **Rebuild Android app**: `npm run android` (or `react-native run-android`)
2. **Clear app data** if already installed: Long-press app → App Info → Storage → Clear Storage
3. **Test in Logcat** to see actual error details
4. **Check backend logs** to see if requests are even reaching the server
5. **Test endpoint** with curl to isolate client vs server issues

## If Still Not Working

1. Check if the backend URL is correct and accessible
2. Verify the POST body format matches backend expectations
3. Look at actual error in Android Studio Logcat (more detailed than the app log)
4. Try with a simpler HTTP POST first to isolate SSE vs network issues
