# ⚡ QUICK SETUP - Screenshot Automation (15 Minutes)
## Get Claude Code Reading Your Screenshots Automatically

**Platform:** Windows (PowerShell)  
**Time:** 15 minutes  
**Difficulty:** Easy ⭐

---

## 🎯 WHAT YOU'LL GET

After setup:
1. Press **Win+Shift+S** (Snipping Tool)
2. Take screenshot
3. Ask Claude Code: **"What do you see?"**
4. Claude automatically sees your screenshot!

**No saving, no uploading, no manual work!**

---

## 📋 STEP-BY-STEP SETUP

### Step 1: Create Project Folders (1 minute)

Open PowerShell in your project folder:

```powershell
# Create directories
New-Item -ItemType Directory -Path "screenshots" -Force
New-Item -ItemType Directory -Path "scripts" -Force

# Verify
ls
# You should see: screenshots/ and scripts/
```

---

### Step 2: Copy PowerShell Script (2 minutes)

1. Download `screenshot-watcher.ps1` from outputs folder
2. Copy to `scripts/screenshot-watcher.ps1` in your project

**Or create manually:**

```powershell
# Create the file
New-Item -ItemType File -Path "scripts\screenshot-watcher.ps1" -Force

# Open in notepad
notepad scripts\screenshot-watcher.ps1

# Paste the PowerShell code from the handover document
# Save and close
```

---

### Step 3: Configure Snipping Tool (3 minutes)

**Option A: Use default Windows Screenshot folder (EASIER)**
- Just press Win+Shift+S and save to your `screenshots/` folder
- Watcher will detect any PNG saved there

**Option B: Configure auto-save location**
1. Open Snipping Tool (Win+Shift+S)
2. Click the `...` menu
3. Go to Settings
4. Check "Automatically save screenshots"
5. Set location to: `C:\path\to\your\project\screenshots`
6. Set name format: `screenshot_{timestamp}`

---

### Step 4: Test the Watcher (3 minutes)

```powershell
# Run the watcher
.\scripts\screenshot-watcher.ps1

# You should see:
# ================================================
# 📸 Screenshot Watcher for Claude Code
# ================================================
# Watching: .\screenshots
# Press Ctrl+C to stop
```

**Now test:**
1. Keep PowerShell window open
2. Press Win+Shift+S
3. Take a screenshot
4. Save to `screenshots/` folder
5. Watch the PowerShell window

**You should see:**
```
[2025-11-05 14:30:15] New screenshot detected: screenshot_20251105.png
  ✓ Saved as latest.png
  ✓ Cleaned up old screenshots
  ✓ Claude Code can now see: screenshots/latest.png
```

**Success!** ✅

Stop the watcher with **Ctrl+C**

---

### Step 5: Add Claude Code Instructions (3 minutes)

Create file `.claude-screenshots.md` in project root:

```markdown
# Claude Code - Screenshot Instructions

## Automatic Screenshot Access

When user mentions screenshot or says:
- "Look at this"
- "Check the screenshot"
- "What do you see"
- "See the error"

Automatically check: **screenshots/latest.png**

Don't ask if they took a screenshot - just look at the file.

## How to Access

```
View latest screenshot: screenshots/latest.png
```

## Example

User: "Fix this error" [after taking screenshot]
You: [Check screenshots/latest.png] "I can see a React error..."
```

---

### Step 6: Configure VS Code (2 minutes)

Create or update `.vscode/settings.json`:

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/screenshots/**": false
  }
}
```

This allows Claude Code to monitor the screenshots folder.

---

### Step 7: Add to .gitignore (1 minute)

```bash
# Add to .gitignore
echo "screenshots/" >> .gitignore
echo "!screenshots/.gitkeep" >> .gitignore

# Create .gitkeep
New-Item -ItemType File -Path "screenshots\.gitkeep" -Force
```

This keeps screenshots local (not in git).

---

## ✅ VERIFICATION TEST

### Test 1: Screenshot Capture

1. Start watcher:
   ```powershell
   .\scripts\screenshot-watcher.ps1
   ```

2. Take screenshot (Win+Shift+S)
3. Save to `screenshots/` folder
4. Check: `screenshots/latest.png` exists

**Pass:** ✅ File exists and watcher logged it

---

### Test 2: Claude Code Integration

1. Open VS Code with Claude Code
2. Take a screenshot of anything
3. In Claude Code, ask:
   ```
   "What do you see in the screenshot?"
   ```

4. Claude should respond with description of the image

**Pass:** ✅ Claude describes the screenshot

---

## 🚀 OPTIONAL: AUTO-START WITH PROJECT

Want the watcher to start automatically?

### Method 1: Add to package.json

```json
{
  "scripts": {
    "screenshot": "powershell -ExecutionPolicy Bypass -File scripts/screenshot-watcher.ps1",
    "dev:full": "concurrently \"npm run dev\" \"npm run log-server\" \"npm run screenshot\""
  }
}
```

Then run:
```bash
npm run dev:full
```

### Method 2: Separate Terminal

Just keep a terminal open with:
```powershell
.\scripts\screenshot-watcher.ps1
```

---

## 💡 DAILY USAGE

### Morning Routine

1. Open your project in VS Code
2. Start watcher:
   ```powershell
   .\scripts\screenshot-watcher.ps1
   ```
3. Leave it running all day

### When You Need Help

1. Take screenshot (Win+Shift+S)
2. Ask Claude Code:
   ```
   "What's wrong with this UI?"
   "Fix this error"
   "How does this look?"
   ```
3. Claude automatically sees your screenshot!

### End of Day

- Press Ctrl+C in watcher terminal
- That's it!

---

## 🎓 USAGE EXAMPLES

### Example 1: Bug Report

```
You: [Take screenshot of error]
You: "Claude, fix this error"

Claude: [Automatically reads latest.png]
"I can see a TypeError on line 234. The issue is..."
[Claude fixes the code]
```

### Example 2: UI Review

```
You: [Take screenshot of your UI]
You: "Does this poker table look right?"

Claude: [Reads latest.png]
"The layout looks good. I'd suggest:
1. Increase spacing between buttons
2. Make the pot amount larger
3. Add hover effects
Want me to update the CSS?"
```

### Example 3: Design Feedback

```
You: [Takes screenshot]
You: "What do you think?"

Claude: [Reads latest.png]
"The design is clean. Here's what I notice:
- Good use of color
- Buttons could be more prominent
- Consider adding shadows for depth
Let me show you some improvements..."
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Execution policy prevents script"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Problem: Watcher doesn't see screenshots

**Check 1:** Is watcher running?
- Look for PowerShell window with "Screenshot Watcher" title

**Check 2:** Are you saving to correct folder?
```powershell
ls screenshots\
# Should show your screenshots
```

**Check 3:** Try manual test
```powershell
# Copy any PNG to screenshots folder
Copy-Item some-image.png screenshots\test.png
# Watcher should detect it
```

---

### Problem: Claude Code doesn't see screenshot

**Check 1:** File exists
```powershell
ls screenshots\latest.png
# Should show the file
```

**Check 2:** Ask explicitly
```
"Read the file screenshots/latest.png and describe what you see"
```

**Check 3:** VS Code settings
- Check `.vscode/settings.json` has `"**/screenshots/**": false`

---

## 📊 WHAT YOU ACCOMPLISHED

✅ Screenshot automation working  
✅ Claude Code can see screenshots  
✅ No manual file management  
✅ Old screenshots auto-deleted  
✅ Ready to debug 10x faster  

---

## 🎯 NEXT STEPS

1. **Try it out:**
   - Take a screenshot of an error
   - Ask Claude Code to fix it
   - Watch the magic happen!

2. **Combine with logs:**
   - Use screenshot automation + console log automation
   - Claude sees both logs AND screenshots
   - Ultimate debugging setup!

3. **Share with team:**
   - Show teammates how to set up
   - Everyone debugs faster

---

## 📚 QUICK REFERENCE

### Start Watcher
```powershell
.\scripts\screenshot-watcher.ps1
```

### With History (keeps last 10)
```powershell
.\scripts\screenshot-watcher.ps1 -KeepHistory -MaxScreenshots 10
```

### Check Latest Screenshot
```powershell
ls screenshots\latest.png
```

### Ask Claude Code
```
"What do you see in the screenshot?"
"Check this UI"
"Fix this error"
"Does this look right?"
```

---

## ✨ YOU'RE DONE!

**Setup time:** 15 minutes  
**Daily time saved:** 10-20 minutes  
**Monthly time saved:** 5+ hours  

**Start taking screenshots and let Claude Code help you debug! 📸**

---

**Version:** 1.0  
**Date:** November 5, 2025  
**Platform:** Windows with PowerShell  
**Alternative platforms:** See main handover document
