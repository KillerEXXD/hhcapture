# LogRocket Troubleshooting Guide

## Issue
Sessions are not appearing in the LogRocket dashboard at https://app.logrocket.com

## Setup Information
- **App ID**: `zrgal7/tpro`
- **LogRocket Version**: 10.1.0
- **Integration Location**: `src/components/LogRocketControl.tsx`

## Diagnostic Steps

### 1. Verify LogRocket Account Access
- [ ] Log in to https://app.logrocket.com
- [ ] Verify you can access the `zrgal7/tpro` app
- [ ] Check if you have the correct permissions (Owner/Admin)

### 2. Test Basic LogRocket Connection
We've created a standalone test page at `test-logrocket.html`. To test:

1. Open the file in your browser: `http://127.0.0.1:3002/test-logrocket.html`
2. The page will auto-run the test
3. Check the console for:
   - "LogRocket.init() called successfully"
   - "User identified: Test User [timestamp]"
   - "Event tracked"
   - "Session URL: [url]"
4. Copy the session URL and check if it appears in your LogRocket dashboard

### 3. Test Main App Integration
1. Open the app: `http://127.0.0.1:3002`
2. Click the grey camera icon (recording button)
3. Choose "New Session"
4. Enter:
   - Tester Name: Your name
   - Session Name: Test Session 1
5. Click "Start Recording"
6. Check browser console (F12) for LogRocket initialization logs:
   - "🚀 [LogRocket] Initializing with app ID: zrgal7/tpro"
   - "✅ [LogRocket] Initialized successfully"
   - "👤 [LogRocket] Identifying user: [name]"
   - "✅ [LogRocket] User identified"
   - "📊 [LogRocket] Tracking session start event"
   - "✅ [LogRocket] Event tracked"
   - "🔗 [LogRocket] Getting session URL..."
   - "✅ [LogRocket] Session URL received: [url]"

### 4. Check Network Activity
Open Browser DevTools (F12) > Network tab:
- [ ] Filter by "logrocket" or "lr-in"
- [ ] Start a recording session
- [ ] Look for network requests to LogRocket servers
- [ ] Check for any failed requests (red entries)
- [ ] Common issues:
  - Ad blockers blocking LogRocket
  - Corporate firewall blocking external tracking
  - CORS issues

### 5. Common Problems & Solutions

#### Problem: No network requests to LogRocket
**Solution**:
- Disable ad blockers (uBlock Origin, AdBlock Plus, etc.)
- Disable privacy extensions (Privacy Badger, Ghostery, etc.)
- Try in an incognito/private window
- Try a different browser

#### Problem: Network requests failing with 401/403
**Solution**:
- Verify the app ID `zrgal7/tpro` is correct
- Check if the app still exists in your LogRocket dashboard
- Verify your LogRocket plan is active

#### Problem: Sessions created but not visible in dashboard
**Solution**:
- Wait 1-2 minutes for sessions to appear
- Check filters in LogRocket dashboard (might be filtering out sessions)
- Verify you're looking at the correct app/project
- Check if sessions are in "Anonymous" filter

#### Problem: "LogRocket is not defined" error
**Solution**:
- Verify `logrocket` package is installed: `npm list logrocket`
- Reinstall if needed: `npm install logrocket@latest`
- Check import statement in `LogRocketControl.tsx`

### 6. Verify Saved Game State
The app saves game state to localStorage when starting a recording:
1. Open Browser DevTools (F12) > Application tab > Local Storage
2. Look for keys starting with `logrocket_hand_`
3. These contain saved game states for re-testing

### 7. LogRocket Dashboard Checklist
When viewing your LogRocket dashboard:
- [ ] Check the date range filter (top right)
- [ ] Check the "Anonymous" vs "Identified" filter
- [ ] Search by user name you entered
- [ ] Search by session name you entered
- [ ] Check "All Sessions" view (not just "Errors" or other filters)

### 8. Code Implementation Details

The LogRocket initialization happens in `src/components/LogRocketControl.tsx`:

```typescript
// Initialize
LogRocket.init('zrgal7/tpro', {
  console: { shouldAggregateConsoleErrors: true },
  network: { requestSanitizer: request => request }
});

// Identify user
LogRocket.identify(testerName, {
  name: testerName,
  role: 'QA Tester',
  sessionName: bugName,
  email: `${testerName.toLowerCase().replace(/\s+/g, '.')}@tester.local`
});

// Track event
LogRocket.track('QA Session Started', {
  bugName,
  testerName,
  timestamp: new Date().toISOString(),
  gameState: { /* ... */ }
});

// Get session URL
LogRocket.getSessionURL((url) => {
  console.log('Session URL:', url);
});
```

### 9. Next Steps If Still Not Working

1. **Check LogRocket Status Page**: https://status.logrocket.com
2. **Contact LogRocket Support**:
   - Email: support@logrocket.com
   - Include: App ID, session URL, browser console logs
3. **Try LogRocket in a Simple Test**:
   - Create a bare-bones HTML file with just LogRocket
   - If that works, there might be a conflict in the app

### 10. Alternative: Use LogRocket CDN (Test)

If the npm package isn't working, you can test with the CDN version:

```html
<script src="https://cdn.lr-in-prod.com/LogRocket.min.js" crossorigin="anonymous"></script>
<script>
  window.LogRocket.init('zrgal7/tpro');
  window.LogRocket.identify('Test User', {
    name: 'Test User',
    email: 'test@test.com'
  });
</script>
```

This is exactly what the `test-logrocket.html` file does.

## Debug Output Locations

1. **Browser Console**: F12 > Console tab
2. **App Console Logs**: `logs/console-logs.txt` (auto-synced)
3. **Network Tab**: F12 > Network tab (filter by "logrocket")

## Expected Behavior

When recording starts successfully, you should see:
1. Camera icon turns from grey to red
2. Console shows all initialization logs
3. Session URL is displayed (you can copy it)
4. Session appears in LogRocket dashboard within 1-2 minutes
5. Game state is saved to localStorage

## Features Implemented

✅ Save game state when recording starts
✅ Load previous game state for re-testing
✅ Search saved sessions by name
✅ Auto-populate all game data (players, stacks, cards, blinds)
✅ Remember tester name
✅ Session name autocomplete
✅ Choice modal: New Session vs Load Previous

## Important Notes

- Sessions are stored in **localStorage** (not LogRocket cloud)
- To access sessions from LogRocket dashboard, you must log in to app.logrocket.com
- LogRocket requires **user identification** to show non-anonymous sessions
- Game state prefills data but does NOT auto-click buttons
