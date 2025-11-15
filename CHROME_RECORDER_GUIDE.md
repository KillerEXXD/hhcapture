# Chrome DevTools Recorder Integration Guide

## Overview

When you start and stop a recording session in the app, it automatically:
1. ✅ Records to **LogRocket** (video replay + full context)
2. ✅ Records to **JSON file** (Chrome DevTools Recorder compatible)

The JSON file is **automatically downloaded** when you click "Stop Recording".

---

## File Naming Format

```
{BugName}_{TesterName}_{Timestamp}.json
```

**Example**:
```
SidePotBug_Ravee_2025-01-15T10-30-45.json
```

---

## Download Location

When you click **"Stop Recording"**, your browser will:
- **Prompt you to choose where to save** the JSON file (Chrome/Edge default behavior)
- OR **Automatically save** to your Downloads folder (if auto-download is enabled)

You can change this in browser settings:
- Chrome: Settings > Downloads > Location
- Edge: Settings > Downloads > Location

---

## How to Import and Replay in Chrome DevTools Recorder

### Step 1: Open Chrome DevTools Recorder

1. Open Chrome or Edge browser
2. Press `F12` or `Ctrl+Shift+I` to open DevTools
3. Click the **"+"** icon to open more tools
4. Select **"Recorder"**

### Step 2: Import the JSON File

1. In the Recorder panel, click **"Import recording"** button
2. Select the downloaded JSON file (e.g., `SidePotBug_Ravee_2025-01-15T10-30-45.json`)
3. The recording will appear in the list

### Step 3: Replay the Session

1. Click on the imported recording to open it
2. Click the **"Replay"** ▶️ button at the top
3. Watch Chrome automatically replay all the actions:
   - Clicks
   - Typing
   - Selections
   - Scrolls
   - Navigation

### Step 4: Edit the Recording (Optional)

You can modify the recording:
- **Add assertions**: Verify element text, attributes, etc.
- **Add steps**: Insert manual steps
- **Remove steps**: Delete unnecessary actions
- **Change selectors**: Update element selectors if needed
- **Adjust timeouts**: Change wait times

### Step 5: Export to Test Code (Optional)

Convert to automated test:
1. Click **"Export"** button
2. Choose format:
   - **Puppeteer**
   - **Playwright**
   - **JSON** (edited version)
3. Use in your CI/CD pipeline

---

## Upload to Google Drive

### Manual Upload (Recommended)

1. Go to https://drive.google.com
2. Click **"New"** > **"File upload"**
3. Select the downloaded JSON file
4. Organize into folders by:
   - Bug name
   - Date
   - Tester name

### Create a Folder Structure

Recommended structure:
```
Google Drive/
└── QA Sessions/
    └── 2025-01/
        ├── SidePotBug_Ravee_2025-01-15T10-30-45.json
        ├── AnteCalcIssue_John_2025-01-16T14-22-10.json
        └── ...
```

---

## What's Recorded?

The JSON file captures:

✅ **User Interactions**:
- Button clicks
- Text input
- Dropdown selections
- Checkbox/radio changes
- Keyboard shortcuts (Enter, Tab, Escape, etc.)
- Scrolling

✅ **Metadata**:
- Bug name
- Tester name
- Start time
- End time
- Browser info (User Agent)
- Viewport size

✅ **Element Selectors**:
- IDs
- Classes
- Data attributes
- Names
- nth-child positions

---

## JSON File Format

Example of what the JSON looks like:

```json
{
  "title": "SidePotBug - Ravee",
  "version": 1,
  "timeout": 5000,
  "steps": [
    {
      "type": "navigate",
      "url": "http://localhost:3002",
      "assertedEvents": [
        {
          "type": "navigation",
          "url": "http://localhost:3002",
          "title": "Poker Hand Tracker"
        }
      ]
    },
    {
      "type": "click",
      "target": "main",
      "selectors": [["#player-4-action"]],
      "offsetX": 50,
      "offsetY": 20
    },
    {
      "type": "change",
      "target": "main",
      "selectors": [["select[name='action']"]],
      "value": "call"
    }
  ],
  "metadata": {
    "bugName": "SidePotBug",
    "testerName": "Ravee",
    "startTime": "2025-01-15T10:30:45.123Z",
    "endTime": "2025-01-15T10:32:10.456Z",
    "userAgent": "Mozilla/5.0...",
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

---

## Benefits of This Approach

| Feature | LogRocket | JSON Recording |
|---------|-----------|----------------|
| **Video Replay** | ✅ Full video | ❌ No video |
| **Console Logs** | ✅ Captured | ❌ Not captured |
| **Network Activity** | ✅ Full details | ❌ Not captured |
| **Editable Steps** | ❌ No | ✅ Yes |
| **Automated Testing** | ❌ No export | ✅ Export to code |
| **Shareable** | ✅ URL | ✅ File |
| **Offline** | ❌ Cloud only | ✅ Works offline |
| **Free** | Limited plan | ✅ Completely free |

---

## Common Use Cases

### 1. Bug Reproduction
- Record the bug in the app
- Download JSON
- Share with developer
- Developer imports JSON and replays to see exact steps

### 2. Regression Testing
- Record a test scenario once
- Export to Puppeteer/Playwright
- Add to CI/CD pipeline
- Run automatically on every commit

### 3. QA Documentation
- Record test cases as JSON
- Store in Google Drive
- Team members can replay exact scenarios
- No ambiguity in test steps

### 4. Training
- Record how to use features
- New QA testers can replay
- Learn the correct workflow

---

## Troubleshooting

### JSON file not downloading?

**Check**:
1. Browser's download settings
2. Pop-up blocker settings
3. Console logs for errors (F12)

**Fix**: Look for console message:
```
📥 [Recorder] Downloaded JSON: filename.json
```

### Can't import JSON into Chrome Recorder?

**Possible causes**:
1. JSON file is corrupted
2. File format incompatible

**Fix**: Open JSON in text editor and verify it's valid JSON

### Recording has too many steps?

**Normal behavior**:
- Every click, input, scroll is recorded
- You can edit the JSON after import to remove unnecessary steps

### Selectors not working during replay?

**Cause**: Element structure changed

**Fix**:
1. Import JSON into Recorder
2. Click on failing step
3. Update selector manually
4. Save updated recording

---

## Next Steps

1. ✅ Click "Start Recording" in app
2. ✅ Perform your QA testing
3. ✅ Click "Stop Recording"
4. ✅ JSON downloads automatically
5. ✅ Choose where to save it
6. ✅ Upload to Google Drive
7. ✅ Import into Chrome Recorder to replay
8. ✅ Share JSON file with team

---

## Questions?

- **Where is the JSON saved?** → Your browser's download location (you choose when prompted)
- **Can I replay on a different computer?** → Yes! Just import the JSON file
- **Does it work in Firefox?** → JSON works, but Firefox doesn't have Recorder. Use Chrome/Edge.
- **Can I edit the recording?** → Yes, import into Chrome Recorder and edit steps
- **Is the JSON file large?** → Usually 5-50 KB (very small)

---

## Summary

✅ **Automatic**: JSON downloads when you stop recording
✅ **Named properly**: `{BugName}_{TesterName}_{Timestamp}.json`
✅ **Chrome compatible**: Import directly into Chrome DevTools Recorder
✅ **Replayable**: Exact step-by-step reproduction
✅ **Shareable**: Upload to Google Drive, share with team
✅ **Editable**: Modify steps, add assertions
✅ **Exportable**: Convert to Puppeteer/Playwright tests

You now have **two recordings** from one session:
1. **LogRocket**: Video + full context (cloud)
2. **JSON file**: Replayable steps (local file)

Best of both worlds!
