# Git Bash Setup Guide

This guide will help you set up Git Bash to automatically open in the HHTool_Modular directory.

## Quick Launch Options

### Option 1: Use the Batch File (Easiest)
Double-click `launch-gitbash.bat` in the project root to open Git Bash in this directory.

### Option 2: Create Desktop Shortcut

1. Right-click on your Desktop
2. Select **New > Shortcut**
3. Enter this location:
   ```
   "C:\Program Files\Git\git-bash.exe" --cd="C:\Apps\HUDR\HHTool_Modular"
   ```
4. Click **Next**
5. Name it "HHTool Git Bash"
6. Click **Finish**
7. (Optional) Right-click the shortcut > Properties > Change Icon to customize

### Option 3: Pin to Taskbar

1. Create a shortcut using Option 2
2. Right-click the shortcut
3. Select **Pin to taskbar**
4. Delete the desktop shortcut if you don't need it

## Auto-Start on Windows Boot

To automatically launch Git Bash when Windows starts:

### Method 1: Startup Folder (Simple)

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Copy `launch-gitbash.bat` into this folder
4. Git Bash will now launch on every Windows startup

### Method 2: Task Scheduler (Advanced - Allows Delay)

1. Open **Task Scheduler** (search in Start Menu)
2. Click **Create Basic Task**
3. Name: "Launch HHTool Git Bash"
4. Trigger: **When I log on**
5. Action: **Start a program**
6. Program: `C:\Apps\HUDR\HHTool_Modular\launch-gitbash.bat`
7. Check "Open Properties" before finishing
8. In Properties > Triggers > Edit:
   - Enable "Delay task for: 10 seconds" (optional, to delay startup)
9. Click OK

## Set Git Bash Default Directory (Global)

To change the default directory for ALL Git Bash instances:

1. Find the Git Bash shortcut (usually in Start Menu or Desktop)
2. Right-click > Properties
3. In the **Start in** field, enter:
   ```
   C:\Apps\HUDR\HHTool_Modular
   ```
4. Click Apply and OK

## Using ~/.bashrc for Auto-CD

Add this to your Git Bash profile to automatically cd to the project:

1. Open Git Bash
2. Edit your bashrc:
   ```bash
   nano ~/.bashrc
   ```
3. Add this line at the end:
   ```bash
   # Auto-navigate to HHTool project on startup
   if [ "$PWD" = "$HOME" ]; then
     cd /c/Apps/HUDR/HHTool_Modular
   fi
   ```
4. Save (Ctrl+O, Enter, Ctrl+X)
5. Restart Git Bash

This will cd to the project directory only when Git Bash opens in the home directory.

## Verify Setup

After setup, open Git Bash and run:
```bash
pwd
```

You should see:
```
/c/Apps/HUDR/HHTool_Modular
```

## Quick Commands

Once in the project directory:

```bash
# Start development servers with cleanup on Ctrl+C
npm run dev:full

# Kill any running servers on ports 3001 and 3002
npm run kill-ports

# Run just the Vite dev server
npm run dev

# Run just the log server
npm run log-server
```

## Troubleshooting

**Git Bash not found?**
- Check if Git is installed: look for `C:\Program Files\Git\git-bash.exe`
- If in a different location, update the paths in the scripts

**Shortcut doesn't work?**
- Verify the path to git-bash.exe is correct
- Try using the batch file instead

**Auto-start not working?**
- Check the startup folder path is correct
- Verify the batch file has correct permissions
