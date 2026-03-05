# PaperDE Features Guide

Complete visual and functional guide to PaperDE.

## 🖥️ Desktop Interface

### Top Bar (40px height)

```
┌─────────────────────────────────────────────────────────────────┐
│ PaperDE | Applications | Focused App    05 Mar 21:32    🔔 ⚡ │
└─────────────────────────────────────────────────────────────────┘
```

**Left Section:**
- Desktop environment name (PaperDE)
- Applications label
- Currently focused window title

**Center:**
- Live clock (updates every second)
- Format: "DD MMM HH:MM"

**Right Section:**
- 🔔 Notifications button
- ⚡ Power menu (Suspend/Log Out/Shutdown)

### Desktop Area

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 Documents    📝 README.txt                                   │
│                                                                   │
│  📁 Pictures                                                     │
│                                                                   │
│                  ┌──────────────────────┐                        │
│                  │  Terminal Window     │                        │
│                  │  ⚫ 🟡 🟢             │                        │
│                  │                      │                        │
│                  │  $ neofetch          │                        │
│                  └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Paper grid background (20px × 20px)
- Desktop icons (draggable, double-click to open)
- Windows (draggable, resizable)
- Right-click for context menu

### Dock (60px height)

```
┌─────────────────────────────────────────────────────────────────┐
│     [>] [📊] [📁] [🔢] [⚙️] [📝] [⊞]                            │
│      •                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**App Icons (left to right):**
1. **Terminal** (>)
2. **System Monitor** (📊)
3. **Files** (📁)
4. **Calculator** (🔢)
5. **Settings** (⚙️)
6. **Text Editor** (📝)
7. **App Launcher** (⊞)

**Indicators:**
- Blue dot (•) = app is currently open

## 🎨 Theme Modes

### Light Mode (Default)

```
Colors:
├─ Background:  #f5f1e8 (warm beige)
├─ Foreground:  #fdfcfa (off-white)
├─ Text:        #3a3a3a (soft black)
├─ Grid:        #d4cfc4 (subtle tan)
├─ Accent:      #8b9dc3 (pastel blue)
└─ Secondary:   #d4a5c3 (pastel pink)
                #a5c3a5 (pastel green)
```

**Perfect for:**
- Daytime use
- Well-lit environments
- Reading documents
- Gentle on eyes

### Dark Mode

```
Colors:
├─ Background:  #1a1a1a (deep black)
├─ Foreground:  #1f1f1f (charcoal)
├─ Text:        #d0d0d0 (soft white)
├─ Grid:        #404040 (dark gray)
├─ Accent:      #8b9dc3 (pastel blue)
└─ Secondary:   #d4a5c3 (pastel pink)
                #a5c3a5 (pastel green)
```

**Perfect for:**
- Night time use
- Low-light environments
- Reducing eye strain
- Battery saving (OLED displays)

**Toggle:** Settings → Appearance → Theme → Dark

## 🪟 Window Management

### Window Controls

```
┌──────────────────────────────────┐
│ ⚫ 🟡 🟢      Window Title       │  ← Title bar (36px)
├──────────────────────────────────┤
│                                  │
│    Window Content Area           │
│                                  │
└──────────────────────────────────┘
```

**Traffic Lights (macOS-style):**
- **⚫ Red** = Close window
- **🟡 Yellow** = Minimize (send to background)
- **🟢 Green** = Maximize/Restore

### Interactions

**Dragging:**
- Click and hold title bar
- Drag to move window
- Constrained to desktop area

**Resizing:**
- Hover over edges or corners
- Cursor changes to resize icon
- Click and drag to resize
- Minimum: 400×300px

**Focus:**
- Click anywhere on window to focus
- Focused window has blue shadow glow
- Brings window to front (z-index)

## 🖱️ Context Menus

### Desktop Right-Click

```
┌──────────────────────┐
│ 📁 New Folder        │
│ 📝 New File          │
│ ──────────────────── │
│ > Open Terminal Here │
└──────────────────────┘
```

### Icon Right-Click

```
┌──────────────────────┐
│ ▶ Open               │
│ ✏️ Rename            │
│ 📋 Copy              │
│ ──────────────────── │
│ 🗑️ Delete            │
└──────────────────────┘
```

**Features:**
- Smart positioning (stays on screen)
- Click outside to close
- ESC key to close
- Dark mode support

## 🔐 Login Screen

```
          ┌─────────────────────────┐
          │                         │
          │      18:45              │  ← Live time
          │  Wednesday, March 5     │  ← Live date
          │                         │
          │     ┌─────────┐         │
          │     │   👤   │         │  ← User avatar
          │     └─────────┘         │
          │       Paper             │  ← Username
          │                         │
          │     🔒 ________         │  ← Password field
          │                         │
          │     [  Log In  ]        │  ← Submit button
          │                         │
          │ Hint: Password is       │
          │       "Paper"           │
          └─────────────────────────┘
```

**Credentials:**
- Username: `Paper` (pre-filled)
- Password: `Paper` (type it)

**Features:**
- Live clock updates every second
- Shake animation on wrong password
- Clean error messages
- Dark mode support

## 📱 Applications

### 1. Terminal

```
paper@engine ~ $ neofetch
     ██████╗  █████╗ ██████╗ ███████╗██████╗ 
     ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
     ...
     
     OS: PaperEngine
     DE: PaperDE v1.0
     Shell: PaperShell

paper@engine ~ $ _
```

**Commands:**
- `help` - Show all commands
- `clear` - Clear terminal
- `date` - Show current date
- `echo` - Echo text back
- `neofetch` - System info with ASCII art
- `about` - About PaperEngine

### 2. System Monitor

```
┌─────────────────────────────────────┐
│  CPU Usage        Memory      Disk   │
│  [████░░] 32%    [█████░] 48%  65%  │
│  4 cores         7.8/16 GB          │
│  @ 2.4GHz        325/512 GB         │
├─────────────────────────────────────┤
│  CPU Usage Over Time                │
│  [Live Chart with Area Fill]        │
├─────────────────────────────────────┤
│  Memory Usage Over Time             │
│  [Live Chart with Line Graph]       │
└─────────────────────────────────────┘
```

**Features:**
- Real-time stats (updates every 2s)
- Beautiful Recharts graphs
- CPU, Memory, and Disk cards
- Responsive design

### 3. File Manager

```
┌──────────┬──────────────────────────┐
│ 🏠 Home  │  Home / Documents        │
│ ⬇️ Down  │  ───────────────────     │
│ 📄 Docs  │  📁 Work Projects        │
│ 🖼️ Pics  │  📁 Personal             │
│ 🎵 Music │  📝 notes.txt    2.4 KB  │
│          │  📄 project.pdf  1.2 MB  │
│          │  🖼️ vacation.jpg 3.8 MB  │
└──────────┴──────────────────────────┘
```

**Features:**
- Sidebar quick access
- Breadcrumb navigation
- File type icons
- Size and modified date
- Desktop folder integration

### 4. Calculator

```
┌──────────────────┐
│          0       │  ← Display
├──────────────────┤
│ C   ±   %   ÷   │
│ 7   8   9   ×   │
│ 4   5   6   -   │
│ 1   2   3   +   │
│ 0       .   =   │
└──────────────────┘
```

**Features:**
- All basic operations
- Decimal support
- Negative numbers
- Percentage calculation
- Clear button

### 5. Settings

```
┌────────────┬─────────────────────────┐
│ 📡 Wi-Fi   │  Appearance             │
│ 🔵 Blue..  │  ────────────────────   │
│ 🔔 Notif.. │  Theme                  │
│ 🎨 Appear..│  [Light] [Dark]         │
│ 🖥️ Display │                         │
│ 🔊 Sound   │  Accent Color           │
│ 🔒 Privacy │  [●] [●] [●] [●]        │
│ 👤 Users   │                         │
└────────────┴─────────────────────────┘
```

**Sections:**
- Wi-Fi & Networking
- Bluetooth Devices
- Notifications
- **Appearance** (Theme switcher!)
- Display Settings
- Sound Settings
- Privacy & Security
- Users & Accounts

### 6. Text Editor

```
┌─────────────────────────────────────┐
│ 📂 Open  💾 Save  [T] [<] [^] [>]  │
├─────────────────────────────────────┤
│ Start typing...                     │
│                                     │
│ _                                   │
├─────────────────────────────────────┤
│ Lines: 3  Words: 8  Characters: 42 │
└─────────────────────────────────────┘
```

**Features:**
- Word/line/character count
- Clean toolbar
- Monospace font
- Plain text editing

### 7. App Launcher

```
┌─────────────────────────────────────┐
│  🔍 Search applications...          │
├─────────────────────────────────────┤
│  [>]         [📊]        [📁]       │
│  Terminal    Monitor     Files      │
│                                     │
│  [🔢]        [⚙️]         [📝]       │
│  Calc        Settings    Editor     │
└─────────────────────────────────────┘
```

**Features:**
- Grid layout (4 columns)
- Search filter
- Hover animations
- Beautiful app icons

## ⚡ Power Menu

```
┌──────────────┐
│ 🌙 Suspend   │
│ 🚪 Log Out   │
│ ⚡ Shutdown  │
└──────────────┘
```

**Actions:**
- **Suspend** - Sleep system (TODO: integrate systemd)
- **Log Out** - Return to login screen
- **Shutdown** - Power off (TODO: integrate systemd)

## 🎯 Quick Actions

### Common Tasks

**Open an app:**
1. Click icon in dock
2. OR: Click App Launcher (⊞)
3. OR: Double-click desktop icon

**Close a window:**
1. Click red button (⚫)
2. OR: Right-click title bar → Close

**Switch between windows:**
- Click on any visible window
- Window comes to front

**Create desktop items:**
1. Right-click desktop
2. Select "New Folder" or "New File"
3. Item appears on desktop

**Change theme:**
1. Open Settings (⚙️)
2. Click "Appearance"
3. Select Light or Dark

**Log out:**
1. Click power button in top-right
2. Select "Log Out"
3. Returns to login screen

## 🎨 Design Philosophy

**Minimalism:**
- No unnecessary elements
- Clean, flat design
- Generous whitespace
- Focus on content

**Paper Aesthetic:**
- Warm, beige tones
- Subtle grid pattern
- Soft shadows
- Natural feel

**Consistency:**
- Same spacing (4/8/16px)
- Same border radius (8-12px)
- Same accent colors
- Same typography

**Accessibility:**
- Good contrast ratios
- Clear focus indicators
- Readable fonts (14-16px body)
- Color-blind friendly accents

---

**Enjoy your clean, minimal desktop! 📄✨**
