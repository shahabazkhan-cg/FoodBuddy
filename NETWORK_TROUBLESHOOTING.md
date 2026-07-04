# Network Error Troubleshooting Guide

## Summary

You're seeing "Network request failed" errors when trying to use the SSE chat stream. This guide will help you diagnose and fix the issue.

## What Was Added

### 1. **Android Network Security Configuration**
- **File**: `android/app/src/main/res/xml/network_security_config.xml`
- **Purpose**: Allows secure HTTPS traffic to your Azure backend
- **Updates Made**: 
  - Added to `AndroidManifest.xml` as `android:networkSecurityConfig`

### 2. **Enhanced SSE Debugging**
- **File**: `src/hooks/useChatStream.ts`
- **Improvements**:
  - Added `Connection: keep-alive` header
  - Added `openWhenHidden: true` to keep connections alive when app is backgrounded
  - Enhanced error logging with stack traces
  - Better timestamp and context in error messages

### 3. **Network Diagnostics Utility**
- **File**: `src/utils/networkDebug.ts`
- **Available Functions**:
  - `testNetworkConnectivity()` - Check basic internet
  - `testAPIEndpoint()` - Check API reachability
  - `testSSEEndpoint()` - Test SSE specifically
  - `runNetworkDiagnostics()` - Run all tests

## Quick Diagnostics in Console

Open your app's developer console and run:

```javascript
// Test all network connectivity
__FOODBUDDY_DEBUG__.runNetworkDiagnostics()

// Or test individually
__FOODBUDDY_DEBUG__.testNetworkConnectivity()      // Check internet
__FOODBUDDY_DEBUG__.testAPIEndpoint()              // Check API
__FOODBUDDY_DEBUG__.testSSEEndpoint()              // Check SSE stream
```

## Step-by-Step Troubleshooting

### Step 1: Verify Android Build with New Config
```bash
# Clear and rebuild Android app
cd android
./gradlew clean
cd ..
npm run android

# Or if using Expo:
npx expo run:android
```

### Step 2: Check Logcat for Real Error Details
```bash
# In Android Studio Terminal, or:
adb logcat | grep -E "Network|okhttp|SSL|ERROR"

# More verbose:
adb logcat | grep "FoodBuddy" | grep -E "ERROR|Network"
```

### Step 3: Verify Backend is Running
```bash
# Test endpoint in terminal
curl -X POST https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/chat/sse \
  -H "Content-Type: application/json" \
  -d '{"user_input":"Test","conversationId":null}' \
  -v
```

Expected response should include:
- Status: `200 OK`
- Headers: `Content-Type: text/event-stream`
- Body: Stream of events starting with `:` or `data:`

### Step 4: Test from Device
1. Open the app and go to **Chat Screen**
2. Open **Debug Console** (bottom-right 📋 button in dev mode)
3. Type a test message
4. Watch the logs:
   - Should see: `[INFO] [Chat] Opening SSE stream to https://...`
   - If error: `[ERROR] [Chat] SSE stream error`
5. Check logs for the actual error message

### Step 5: Rebuild and Test Again
```bash
# Fresh build on device
npm start
# In another terminal:
npm run android

# Clear app cache if needed:
adb shell pm clear com.foodbuddy  # or your app package name
```

## Common Issues & Solutions

### Issue: "Network request failed" with no details
**Causes**: Connection timeout, SSL cert issue, DNS resolution failure
**Solutions**:
1. Run `__FOODBUDDY_DEBUG__.testNetworkConnectivity()`
2. Check if internet works on device (open browser)
3. Check Logcat for actual error
4. Try from same network as development machine

### Issue: "Server responded with 404 or 500"
**Cause**: Backend endpoint not available or wrong URL
**Solutions**:
1. Verify URL in `src/store/api/config.ts`
2. Test endpoint with curl (see Step 3 above)
3. Check Azure backend logs
4. Verify backend is deployed and running

### Issue: Timeout errors
**Cause**: Slow network or server response
**Solutions**:
1. Increase timeout in `useChatStream.ts` (change `10000` to `30000`)
2. Check network speed: Run `__FOODBUDDY_DEBUG__.testNetworkConnectivity()`
3. Check backend performance/logs

### Issue: SSL Certificate errors
**Cause**: Certificate validation failing
**Symptoms**: "Certificate verify failed" or similar in logs
**Solutions**:
1. Verify Azure domain is valid: Test in browser
2. Check `network_security_config.xml` includes the domain
3. Verify it's HTTPS not HTTP

### Issue: Works in iOS/browser but not Android
**Cause**: Android network security policies
**Solutions**:
1. Verify `android:networkSecurityConfig` is in `AndroidManifest.xml`
2. Check `network_security_config.xml` permissions
3. Try disabling cleartext traffic requirement temporarily for testing

## Debug Logging Output Examples

### ✅ Successful Connection
```
[INFO] [Chat] Opening SSE stream to https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/chat/sse
[DEBUG] [Chat] SSE stream opened: 200 {status: 200, contentType: "text/event-stream"}
[DEBUG] [Chat] SSE event received { eventData: '{"token":"Hello"}' }
[DEBUG] [Chat] SSE event received { eventData: '{"token":" ","done":true}' }
[INFO] [Chat] Stream finalized with [DONE]
```

### ❌ Connection Failed
```
[INFO] [Chat] Opening SSE stream to https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/chat/sse
[ERROR] [Chat] SSE stream error {
  error: "Network request failed",
  errorName: "TypeError",
  url: "https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/chat/sse",
  timestamp: "2026-07-04T12:00:00.000Z"
}
```

## Files Modified

```
android/app/src/main/AndroidManifest.xml
  - Added: android:networkSecurityConfig="@xml/network_security_config"

android/app/src/main/res/xml/network_security_config.xml
  - NEW: Configures HTTPS for Azure backend

src/hooks/useChatStream.ts
  - Enhanced error logging
  - Added Connection: keep-alive header
  - Added openWhenHidden: true

src/utils/networkDebug.ts
  - NEW: Network diagnostics utilities
```

## Next Steps

1. **Rebuild app** with the new Android network config
2. **Run diagnostics** in console: `__FOODBUDDY_DEBUG__.runNetworkDiagnostics()`
3. **Check Logcat** for specific error details
4. **Test endpoint** with curl to verify backend is responding
5. **Enable Debug Console** in app to see real-time logs

## Additional Resources

- Android Network Security: https://developer.android.com/training/articles/security-config
- React Native Network: https://reactnative.dev/docs/network
- Debugging with Logcat: https://developer.android.com/studio/command-line/logcat
