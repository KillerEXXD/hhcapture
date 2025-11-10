# 📸 AUTOMATED SCREENSHOT CAPTURE FOR CLAUDE CODE
## Complete Handover Document - Screenshot → Claude Code Pipeline

**Project:** Automated Screenshot Integration with Claude Code  
**Goal:** Automatically save screenshots to a directory that Claude Code monitors  
**Developer:** Ravee  
**Date:** November 5, 2025

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Solution Architecture](#solution-architecture)
3. [Windows Implementation](#windows-implementation)
4. [macOS Implementation](#macos-implementation)
5. [Linux Implementation](#linux-implementation)
6. [Claude Code Configuration](#claude-code-configuration)
7. [Advanced Features](#advanced-features)
8. [Usage Workflow](#usage-workflow)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

### The Problem
- Taking screenshots with Snipping Tool
- Manually saving to specific folder
- Manually telling Claude Code about screenshot
- Screenshots pile up over time

### The Solution
**Automated Screenshot Pipeline:**
```
Snipping Tool → Auto-save to monitored folder → Claude Code reads automatically → Old screenshots deleted
```

### What This Enables
- ✅ Take screenshot with Snipping Tool (Win+Shift+S)
- ✅ Automatically saved to `screenshots/latest.png`
- ✅ Claude Code can see it immediately
- ✅ Previous screenshots auto-deleted (or archived)
- ✅ No manual file management needed

---

## 🏗️ SOLUTION ARCHITECTURE

### Approach 1: PowerShell Watcher (Windows) - RECOMMENDED

```
Windows Snipping Tool (Win+Shift+S)
         ↓
Saves to Screenshots folder
         ↓
PowerShell script watches folder
         ↓
Detects new file
         ↓
1. Renames to "latest.png"
2. Deletes/archives old screenshots
3. Logs the capture
         ↓
Claude Code sees: screenshots/latest.png
         ↓
You ask: "What do you see in the screenshot?"
Claude reads and analyzes automatically!
```

### Approach 2: AutoHotkey Script (Windows) - ADVANCED

```
Press Win+Shift+S (normal Snipping Tool)
         ↓
AutoHotkey intercepts save action
         ↓
Automatically saves to project folder as latest.png
         ↓
Opens prompt: "Tell Claude about this screenshot"
         ↓
Claude Code notified automatically
```

### Approach 3: Python File Watcher (Cross-platform)

```
Python script watches clipboard
         ↓
Detects screenshot copied
         ↓
Saves to screenshots/latest.png
         ↓
Claude Code monitors the file
```

---

## 💻 WINDOWS IMPLEMENTATION

### Solution 1: PowerShell Folder Watcher (EASIEST - 10 min setup)

#### Step 1: Create Screenshot Directory

```powershell
# In your project root
New-Item -ItemType Directory -Path "screenshots" -Force
```

#### Step 2: Configure Windows Snipping Tool

1. Open Snipping Tool settings (Win+Shift+S, click "...")
2. Go to Settings
3. Set "Save screenshots" to: `C:\path\to\your\project\screenshots`
4. Set filename format to: `screenshot_{timestamp}`

#### Step 3: Create PowerShell Watcher Script

**File:** `scripts/screenshot-watcher.ps1`

```powershell
# screenshot-watcher.ps1
# Watches screenshots folder and keeps only latest screenshot

param(
    [string]$WatchPath = ".\screenshots",
    [int]$MaxScreenshots = 5,
    [switch]$KeepHistory
)

$ErrorActionPreference = "SilentlyContinue"

# Ensure directory exists
if (-not (Test-Path $WatchPath)) {
    New-Item -ItemType Directory -Path $WatchPath -Force | Out-Null
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📸 Screenshot Watcher for Claude Code" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Watching: $WatchPath" -ForegroundColor Green
Write-Host "Keep History: $KeepHistory" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Create file system watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $WatchPath
$watcher.Filter = "*.png"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

# Define the action
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $fileName = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Wait a moment for file to finish writing
    Start-Sleep -Milliseconds 500
    
    if ($changeType -eq "Created") {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] New screenshot detected: $fileName" -ForegroundColor Green
        
        # Copy to latest.png
        $latestPath = Join-Path $WatchPath "latest.png"
        try {
            Copy-Item $path $latestPath -Force
            Write-Host "  ✓ Saved as latest.png" -ForegroundColor Cyan
            
            # Archive or delete old screenshots
            if ($using:KeepHistory) {
                # Keep last N screenshots
                $screenshots = Get-ChildItem $WatchPath -Filter "screenshot_*.png" | 
                               Sort-Object CreationTime -Descending
                
                if ($screenshots.Count -gt $using:MaxScreenshots) {
                    $toDelete = $screenshots | Select-Object -Skip $using:MaxScreenshots
                    foreach ($old in $toDelete) {
                        Remove-Item $old.FullPath -Force
                        Write-Host "  ✓ Archived old: $($old.Name)" -ForegroundColor Gray
                    }
                }
            } else {
                # Delete all old screenshots except latest.png
                Get-ChildItem $WatchPath -Filter "screenshot_*.png" | 
                    Where-Object { $_.Name -ne "latest.png" } |
                    Remove-Item -Force
                Write-Host "  ✓ Cleaned up old screenshots" -ForegroundColor Gray
            }
            
            # Create a marker file for Claude Code
            $markerPath = Join-Path $WatchPath "new-screenshot.txt"
            Get-Date -Format "yyyy-MM-dd HH:mm:ss" | Out-File $markerPath -Force
            
            Write-Host "  ✓ Claude Code can now see: screenshots/latest.png" -ForegroundColor Green
            Write-Host ""
            
        } catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
        }
    }
}

# Register events
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup on exit
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`n✓ Screenshot watcher stopped" -ForegroundColor Yellow
}
```

#### Step 4: Create Start Script

**File:** `scripts/start-screenshot-watcher.bat`

```batch
@echo off
echo Starting Screenshot Watcher...
powershell -ExecutionPolicy Bypass -File "%~dp0screenshot-watcher.ps1"
pause
```

#### Step 5: Auto-start with Project (Optional)

**Add to package.json:**
```json
{
  "scripts": {
    "screenshot-watcher": "powershell -ExecutionPolicy Bypass -File scripts/screenshot-watcher.ps1",
    "dev:full": "concurrently \"npm run dev\" \"npm run log-server\" \"npm run screenshot-watcher\" --names \"APP,LOGS,SHOTS\" --prefix-colors \"cyan,green,magenta\""
  }
}
```

---

### Solution 2: AutoHotkey Script (ADVANCED - Power Users)

#### Step 1: Install AutoHotkey

Download from: https://www.autohotkey.com/

#### Step 2: Create AHK Script

**File:** `scripts/screenshot-helper.ahk`

```ahk
; screenshot-helper.ahk
; Automatically saves Snipping Tool screenshots to project folder

#NoEnv
#SingleInstance Force
SetWorkingDir %A_ScriptDir%\..

; Configuration
projectFolder := A_ScriptDir . "\..\screenshots"
latestFile := projectFolder . "\latest.png"

; Ensure directory exists
FileCreateDir, %projectFolder%

; Create tray menu
Menu, Tray, Tip, Screenshot Helper for Claude Code
Menu, Tray, NoStandard
Menu, Tray, Add, Open Screenshots Folder, OpenFolder
Menu, Tray, Add, Reload Script, ReloadScript
Menu, Tray, Add, Exit, ExitScript

; Show startup notification
TrayTip, Screenshot Helper, Monitoring screenshots for Claude Code, 3, 1

; Monitor clipboard for screenshots
SetTimer, CheckClipboard, 1000
return

CheckClipboard:
    ; Check if clipboard contains an image
    if DllCall("IsClipboardFormatAvailable", "uint", 2) ; CF_BITMAP
    {
        ; Get current clipboard image
        pBitmap := Gdip_BitmapFromClipboard()
        
        if (pBitmap)
        {
            ; Save as latest.png
            Gdip_SaveBitmapToFile(pBitmap, latestFile)
            Gdip_DisposeImage(pBitmap)
            
            ; Show notification
            TrayTip, Screenshot Saved, Saved to screenshots/latest.png`nClaude Code can now see it!, 3, 1
            
            ; Clean up old screenshots
            Loop, Files, %projectFolder%\screenshot_*.png
            {
                if (A_LoopFileName != "latest.png")
                    FileDelete, %A_LoopFileLongPath%
            }
        }
    }
return

OpenFolder:
    Run, explorer.exe "%projectFolder%"
return

ReloadScript:
    Reload
return

ExitScript:
    ExitApp
return

; Include GDI+ library (you'll need to download this)
#Include %A_ScriptDir%\Gdip.ahk
```

#### Step 3: Auto-start AHK Script

Create shortcut to `screenshot-helper.ahk` in:
```
C:\Users\[YourName]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

---

### Solution 3: Python Clipboard Watcher (CROSS-PLATFORM)

#### Step 1: Install Dependencies

```bash
pip install pillow watchdog pyperclip
```

#### Step 2: Create Python Watcher

**File:** `scripts/screenshot_watcher.py`

```python
#!/usr/bin/env python3
"""
Screenshot Watcher for Claude Code
Monitors clipboard for screenshots and saves to screenshots/latest.png
"""

import os
import sys
import time
from pathlib import Path
from PIL import ImageGrab, Image
import hashlib
from datetime import datetime

# Configuration
SCREENSHOT_DIR = Path(__file__).parent.parent / "screenshots"
LATEST_FILE = SCREENSHOT_DIR / "latest.png"
KEEP_HISTORY = False
MAX_SCREENSHOTS = 5

# Ensure directory exists
SCREENSHOT_DIR.mkdir(exist_ok=True)

class ScreenshotWatcher:
    def __init__(self):
        self.last_hash = None
        self.screenshot_count = 0
        
    def get_clipboard_image(self):
        """Get image from clipboard"""
        try:
            img = ImageGrab.grabclipboard()
            if isinstance(img, Image.Image):
                return img
        except Exception as e:
            pass
        return None
    
    def get_image_hash(self, img):
        """Get hash of image to detect duplicates"""
        return hashlib.md5(img.tobytes()).hexdigest()
    
    def save_screenshot(self, img):
        """Save screenshot to latest.png and cleanup old ones"""
        try:
            # Save as latest.png
            img.save(LATEST_FILE, 'PNG')
            self.screenshot_count += 1
            
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] ✓ Screenshot saved as latest.png")
            
            # Optionally save with timestamp
            if KEEP_HISTORY:
                ts_filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                ts_path = SCREENSHOT_DIR / ts_filename
                img.save(ts_path, 'PNG')
                print(f"  ✓ Also saved as {ts_filename}")
                
                # Cleanup old screenshots
                self.cleanup_old_screenshots()
            else:
                # Delete all old screenshots
                for f in SCREENSHOT_DIR.glob("screenshot_*.png"):
                    f.unlink()
            
            # Create marker for Claude Code
            marker_file = SCREENSHOT_DIR / "new-screenshot.txt"
            marker_file.write_text(timestamp)
            
            print(f"  ✓ Claude Code can now see: screenshots/latest.png")
            print()
            
        except Exception as e:
            print(f"  ✗ Error saving screenshot: {e}")
    
    def cleanup_old_screenshots(self):
        """Keep only last N screenshots"""
        screenshots = sorted(
            SCREENSHOT_DIR.glob("screenshot_*.png"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        
        if len(screenshots) > MAX_SCREENSHOTS:
            for old_file in screenshots[MAX_SCREENSHOTS:]:
                old_file.unlink()
                print(f"  ✓ Deleted old: {old_file.name}")
    
    def watch(self):
        """Main watch loop"""
        print("=" * 60)
        print("📸 Screenshot Watcher for Claude Code")
        print("=" * 60)
        print(f"Watching clipboard for screenshots")
        print(f"Save location: {SCREENSHOT_DIR}")
        print(f"Keep history: {KEEP_HISTORY}")
        print("Press Ctrl+C to stop")
        print()
        
        try:
            while True:
                img = self.get_clipboard_image()
                
                if img:
                    # Check if it's a new screenshot
                    img_hash = self.get_image_hash(img)
                    
                    if img_hash != self.last_hash:
                        self.last_hash = img_hash
                        self.save_screenshot(img)
                
                time.sleep(0.5)  # Check every 500ms
                
        except KeyboardInterrupt:
            print("\n✓ Screenshot watcher stopped")
            sys.exit(0)

if __name__ == "__main__":
    watcher = ScreenshotWatcher()
    watcher.watch()
```

#### Step 3: Create Start Script

**File:** `scripts/start-screenshot-watcher.sh` (Unix)
```bash
#!/bin/bash
cd "$(dirname "$0")/.."
python3 scripts/screenshot_watcher.py
```

**File:** `scripts/start-screenshot-watcher.bat` (Windows)
```batch
@echo off
cd /d "%~dp0\.."
python scripts\screenshot_watcher.py
pause
```

#### Step 4: Add to npm scripts

```json
{
  "scripts": {
    "screenshot-watcher": "python scripts/screenshot_watcher.py"
  }
}
```

---

## 🍎 MACOS IMPLEMENTATION

### Solution: Automator + Python Watcher

#### Step 1: Configure macOS Screenshot Location

```bash
# Set screenshot location
defaults write com.apple.screencapture location ~/path/to/your/project/screenshots

# Reload settings
killall SystemUIServer
```

#### Step 2: Create Folder Action (Automator)

1. Open Automator
2. Create new "Folder Action"
3. Choose folder: `screenshots/`
4. Add action "Run Shell Script"

```bash
#!/bin/bash

# Get the path of the new screenshot
screenshot_path="$1"

# Copy to latest.png
cp "$screenshot_path" "$(dirname "$screenshot_path")/latest.png"

# Delete old screenshots (keep only latest + last 5)
cd "$(dirname "$screenshot_path")"
ls -t screenshot_*.png | tail -n +6 | xargs rm -f

# Notify
osascript -e 'display notification "Screenshot saved for Claude Code" with title "Screenshot Helper"'
```

5. Save as "Screenshot Manager"

---

## 🐧 LINUX IMPLEMENTATION

### Solution: inotify + Script

#### Step 1: Install inotify-tools

```bash
sudo apt install inotify-tools  # Debian/Ubuntu
# or
sudo dnf install inotify-tools  # Fedora
```

#### Step 2: Create Watcher Script

**File:** `scripts/screenshot-watcher.sh`

```bash
#!/bin/bash

SCREENSHOT_DIR="$(cd "$(dirname "$0")/.." && pwd)/screenshots"
LATEST_FILE="$SCREENSHOT_DIR/latest.png"

# Ensure directory exists
mkdir -p "$SCREENSHOT_DIR"

echo "================================================"
echo "📸 Screenshot Watcher for Claude Code"
echo "================================================"
echo "Watching: $SCREENSHOT_DIR"
echo "Press Ctrl+C to stop"
echo ""

# Watch for new files
inotifywait -m -e create --format '%w%f' "$SCREENSHOT_DIR" | while read new_file
do
    # Only process PNG files
    if [[ "$new_file" == *.png ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] New screenshot: $(basename "$new_file")"
        
        # Wait for file to finish writing
        sleep 0.5
        
        # Copy to latest.png
        cp "$new_file" "$LATEST_FILE"
        echo "  ✓ Saved as latest.png"
        
        # Delete old screenshots
        find "$SCREENSHOT_DIR" -name "screenshot_*.png" -type f ! -name "latest.png" -delete
        echo "  ✓ Cleaned up old screenshots"
        
        # Create marker
        date '+%Y-%m-%d %H:%M:%S' > "$SCREENSHOT_DIR/new-screenshot.txt"
        
        echo "  ✓ Claude Code can now see: screenshots/latest.png"
        echo ""
    fi
done
```

Make executable:
```bash
chmod +x scripts/screenshot-watcher.sh
```

---

## 🤖 CLAUDE CODE CONFIGURATION

### Step 1: Create Claude Instructions

**File:** `.claude-screenshots.md`

```markdown
# Claude Code - Screenshot Instructions

## Automatic Screenshot Access

This project has automated screenshot capture enabled.

### How It Works

1. User takes screenshot with Snipping Tool (Win+Shift+S)
2. Screenshot automatically saved to `screenshots/latest.png`
3. Old screenshots are automatically cleaned up
4. You can access the latest screenshot at any time

### When to Check Screenshots

User phrases that indicate they took a screenshot:
- "Look at this"
- "Check the screenshot"
- "See the image"
- "What do you see here"
- "Can you see this error"
- "Look at the UI"
- "See the problem"

### How to Access

```
View the latest screenshot: screenshots/latest.png
```

### What to Do

1. When user mentions screenshot, immediately check `screenshots/latest.png`
2. Analyze what you see
3. Provide specific feedback about the screenshot content
4. Reference specific UI elements, errors, or issues you see

### Example Interactions

**User:** "I'm getting this error, check the screenshot"
**You:** [Check screenshots/latest.png] "I can see a React error: 
'Cannot read property stack of undefined' on line 234. 
The error is in your pot calculation function..."

**User:** "Does this UI look right?"
**You:** [Check screenshots/latest.png] "Looking at your UI, 
I notice the betting buttons are overlapping the player cards. 
Let me fix the CSS..."

### Automatic Checking

If user says:
- "screenshot"
- "look at"
- "check this"
- "see"

Automatically check `screenshots/latest.png` without asking.

### File Structure

```
screenshots/
├── latest.png          ← Always check this file
├── new-screenshot.txt  ← Timestamp of last screenshot
└── screenshot_*.png    ← Optional history (if enabled)
```

### Important Notes

- Always look at `latest.png` first
- Don't ask "did you take a screenshot?" - just check the file
- If file doesn't exist, ask user to take screenshot
- Provide specific feedback about what you see in the image
```

---

### Step 2: Update .vscode/settings.json

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/screenshots/**": false
  },
  "files.associations": {
    "*.md": "markdown"
  },
  "claude.autoReadImages": true,
  "claude.watchedFolders": [
    "screenshots"
  ]
}
```

---

### Step 3: Add to .gitignore

```bash
# .gitignore

# Screenshots (local development only)
screenshots/
!screenshots/.gitkeep

# Screenshot watcher scripts
scripts/*.log
```

Create `.gitkeep`:
```bash
mkdir -p screenshots
touch screenshots/.gitkeep
```

---

## 🚀 USAGE WORKFLOW

### Daily Development Flow

#### 1. Start Your Development Environment

```bash
# Start everything (with screenshot watcher)
npm run dev:full

# Or start screenshot watcher separately
npm run screenshot-watcher
```

#### 2. Take Screenshots

**Windows:**
- Press `Win+Shift+S`
- Select area
- Screenshot auto-saves to `screenshots/`
- Watcher renames to `latest.png`

**macOS:**
- Press `Cmd+Shift+4` or `Cmd+Shift+5`
- Screenshot auto-saves to configured location

**Linux:**
- Use your screenshot tool (Flameshot, Spectacle, etc.)
- Save to `screenshots/` folder

#### 3. Ask Claude Code

```
You: "Check the screenshot, there's an error"

Claude Code: [Automatically reads screenshots/latest.png]
"I can see a TypeScript error on line 45. The issue is..."
```

**No need to say "the screenshot is at screenshots/latest.png"**
Claude knows to check automatically!

---

### Example Interactions

#### UI Debugging

```
You: "Does this layout look right?"

Claude: [Checks latest.png]
"Looking at your poker table UI, I notice:
1. The betting buttons overlap with player avatars
2. The pot amount is cut off on mobile view
3. The fold button color is too similar to the background

Let me fix the CSS..."
```

#### Error Debugging

```
You: "I'm getting this React error"

Claude: [Checks latest.png]
"I can see the error message:
'TypeError: Cannot read property 'stack' of undefined'

This is happening in HandCollector.tsx line 234.
The issue is you're accessing player.stack before 
checking if player exists. Let me fix it..."
```

#### Design Review

```
You: "What do you think of this design?"

Claude: [Checks latest.png]
"The design looks good overall. Here are some suggestions:
1. Increase contrast on the betting amount text
2. The action buttons could use more spacing
3. Consider adding visual feedback for the current player
4. The pot display is nicely positioned

Would you like me to update the CSS?"
```

---

## 🎯 ADVANCED FEATURES

### Feature 1: OCR for Text Extraction

**Install Tesseract OCR:**

```bash
# Windows
choco install tesseract

# macOS
brew install tesseract

# Linux
sudo apt install tesseract-ocr
```

**Add to Python watcher:**

```python
import pytesseract
from PIL import Image

def extract_text_from_screenshot(image_path):
    """Extract text from screenshot using OCR"""
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    
    # Save extracted text
    text_file = image_path.parent / "latest-text.txt"
    text_file.write_text(text)
    
    return text
```

Now Claude can read text from screenshots!

---

### Feature 2: Annotated Screenshots

**Automatically draw on screenshots:**

```python
from PIL import Image, ImageDraw, ImageFont

def annotate_screenshot(img):
    """Add timestamp and annotations to screenshot"""
    draw = ImageDraw.Draw(img)
    
    # Add timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    font = ImageFont.truetype("arial.ttf", 16)
    draw.text((10, 10), timestamp, fill="red", font=font)
    
    # Add border
    width, height = img.size
    draw.rectangle([(0, 0), (width-1, height-1)], outline="red", width=3)
    
    return img
```

---

### Feature 3: Screenshot History Viewer

**Create simple HTML viewer:**

**File:** `screenshots/viewer.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Screenshot History</title>
    <style>
        body {
            font-family: Arial;
            padding: 20px;
            background: #f0f0f0;
        }
        .screenshot {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .screenshot img {
            max-width: 100%;
            border: 1px solid #ddd;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>📸 Screenshot History</h1>
    <div id="screenshots"></div>
    
    <script>
        async function loadScreenshots() {
            // List all PNG files
            const response = await fetch('/api/screenshots');
            const screenshots = await response.json();
            
            const container = document.getElementById('screenshots');
            screenshots.forEach(shot => {
                const div = document.createElement('div');
                div.className = 'screenshot';
                div.innerHTML = `
                    <div class="timestamp">${shot.timestamp}</div>
                    <img src="${shot.path}" alt="Screenshot">
                `;
                container.appendChild(div);
            });
        }
        
        loadScreenshots();
    </script>
</body>
</html>
```

---

### Feature 4: AI-Powered Screenshot Analysis

**Integrate with Claude API:**

```python
import anthropic

def analyze_screenshot_with_claude(image_path):
    """Send screenshot to Claude API for analysis"""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    
    # Read image
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode()
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": "Analyze this screenshot. What UI issues or errors do you see?"
                }
            ]
        }]
    )
    
    # Save analysis
    analysis_file = image_path.parent / "latest-analysis.txt"
    analysis_file.write_text(message.content[0].text)
    
    print(f"AI Analysis: {message.content[0].text}")
```

---

### Feature 5: Comparison Mode

**Compare before/after screenshots:**

```python
def save_comparison(new_screenshot):
    """Save new screenshot alongside previous for comparison"""
    # Copy current latest to previous
    if LATEST_FILE.exists():
        previous_file = SCREENSHOT_DIR / "previous.png"
        shutil.copy(LATEST_FILE, previous_file)
    
    # Save new as latest
    new_screenshot.save(LATEST_FILE)
    
    # Create side-by-side comparison
    if previous_file.exists():
        create_side_by_side(previous_file, LATEST_FILE)

def create_side_by_side(img1_path, img2_path):
    """Create side-by-side comparison image"""
    img1 = Image.open(img1_path)
    img2 = Image.open(img2_path)
    
    # Resize to same height
    height = min(img1.height, img2.height)
    img1 = img1.resize((int(img1.width * height / img1.height), height))
    img2 = img2.resize((int(img2.width * height / img2.height), height))
    
    # Create comparison
    total_width = img1.width + img2.width + 20
    comparison = Image.new('RGB', (total_width, height), 'white')
    comparison.paste(img1, (0, 0))
    comparison.paste(img2, (img1.width + 20, 0))
    
    # Save
    comparison.save(SCREENSHOT_DIR / "comparison.png")
    print("  ✓ Created comparison.png")
```

---

## 🔧 TROUBLESHOOTING

### Windows Issues

#### Problem: PowerShell script won't run

**Error:** "Execution policy prevents script"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

#### Problem: Snipping Tool doesn't save to folder

**Solution:**
1. Open Snipping Tool settings
2. Check "Automatically save screenshots"
3. Set save location to your project folder
4. Or use the clipboard watcher instead

---

#### Problem: Watcher doesn't detect screenshots

**Check 1:** Is watcher running?
```powershell
Get-Process -Name powershell | Where-Object {$_.CommandLine -like "*screenshot-watcher*"}
```

**Check 2:** Is folder correct?
```powershell
Get-ChildItem .\screenshots
```

**Solution:** Restart watcher script

---

### macOS Issues

#### Problem: Screenshot location doesn't change

**Solution:**
```bash
# Reset to defaults
defaults delete com.apple.screencapture location

# Set again
defaults write com.apple.screencapture location ~/path/to/project/screenshots

# Apply
killall SystemUIServer
```

---

### Linux Issues

#### Problem: inotify not detecting files

**Solution:**
```bash
# Increase inotify watches
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### Claude Code Issues

#### Problem: Claude doesn't see screenshots

**Check 1:** File exists
```bash
ls -la screenshots/latest.png
```

**Check 2:** VS Code settings
```json
{
  "files.watcherExclude": {
    "**/screenshots/**": false  // Must be false!
  }
}
```

**Check 3:** Ask explicitly
```
"Read the file screenshots/latest.png and tell me what you see"
```

---

## 📊 COMPARISON TABLE

| Solution | OS | Setup Time | Auto-start | Best For |
|----------|----|-----------:|:----------:|----------|
| PowerShell Watcher | Windows | 10 min | ✅ | Easy setup |
| AutoHotkey | Windows | 20 min | ✅ | Power users |
| Python Watcher | All | 15 min | ✅ | Cross-platform |
| Automator | macOS | 15 min | ✅ | Mac users |
| inotify | Linux | 10 min | ✅ | Linux users |

---

## ✅ IMPLEMENTATION CHECKLIST

### Quick Setup (Windows PowerShell - RECOMMENDED)

- [ ] Create `screenshots/` directory
- [ ] Copy `screenshot-watcher.ps1` script
- [ ] Configure Snipping Tool save location
- [ ] Test: Take screenshot, check `latest.png` created
- [ ] Add `.claude-screenshots.md` instructions
- [ ] Update `.vscode/settings.json`
- [ ] Test with Claude Code
- [ ] Add to `.gitignore`
- [ ] Optional: Add to npm scripts for auto-start

**Total Time:** 15-20 minutes

---

## 🎯 SUCCESS CRITERIA

You're done when:

1. ✅ Take screenshot with Win+Shift+S (or OS equivalent)
2. ✅ Screenshot auto-saves to `screenshots/latest.png`
3. ✅ Old screenshots are auto-deleted
4. ✅ Claude Code can see latest screenshot
5. ✅ You ask "what do you see?" and Claude describes it
6. ✅ No manual file management needed

---

## 🎓 USAGE EXAMPLES

### Example 1: Bug Report

```
You: *Takes screenshot of error*
You: "Fix this error"

Claude: [Automatically checks latest.png]
"I can see a React error: 'Cannot read property...'
The issue is on line 234. Let me fix it..."
```

### Example 2: UI Review

```
You: *Takes screenshot of poker table*
You: "How does this look?"

Claude: [Checks latest.png]
"The poker table looks good. I notice:
- The betting buttons are well-positioned
- Consider increasing the pot text size
- The player cards could use more spacing
Want me to adjust the CSS?"
```

### Example 3: Comparison

```
You: *Takes screenshot*
You: "This is the current design"
You: *Makes changes, takes another screenshot*
You: "Compare these two versions"

Claude: [Checks latest.png and previous.png]
"Comparing the versions:
- Version 2 has better button alignment
- The pot display is more prominent
- Good improvement on the color contrast
I prefer version 2."
```

---

## 📚 QUICK REFERENCE

### Commands

**Windows:**
```powershell
# Start watcher
.\scripts\screenshot-watcher.ps1

# With history enabled
.\scripts\screenshot-watcher.ps1 -KeepHistory -MaxScreenshots 10
```

**Cross-platform (Python):**
```bash
python scripts/screenshot_watcher.py
```

**npm:**
```bash
npm run screenshot-watcher
```

### File Locations

```
screenshots/
├── latest.png              ← Claude always checks this
├── new-screenshot.txt      ← Timestamp marker
├── comparison.png          ← Side-by-side (if enabled)
└── screenshot_*.png        ← History (if enabled)
```

### Ask Claude Code

```
"What do you see in the screenshot?"
"Check the screenshot for errors"
"Compare the before and after"
"Does this UI look right?"
"See the problem in the image"
```

---

## 🎉 FINAL NOTES

### What This Achieves

**Before:**
1. Take screenshot
2. Save manually to specific folder
3. Tell Claude the filename
4. Wait for Claude to look
5. Repeat for each screenshot

**After:**
1. Press Win+Shift+S
2. Ask Claude a question
3. Done!

### Time Savings

- **Per screenshot:** 30 seconds → 2 seconds
- **Daily (10 screenshots):** 5 minutes → 20 seconds
- **Weekly:** 25 minutes → 2 minutes

---

**Document Version:** 1.0  
**Date:** November 5, 2025  
**Status:** Ready for Implementation  
**Setup Time:** 15-20 minutes  
**Maintenance:** Zero (automatic)

**Happy debugging with screenshots! 📸**
