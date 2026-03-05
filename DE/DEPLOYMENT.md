# PaperDE Deployment Guide

Complete guide for packaging and deploying PaperDE in your custom Linux distribution.

## 📦 Packaging Options

### Option 1: Electron App (Recommended for Desktop)

PaperDE works great as an Electron app for full desktop integration.

#### 1. Install Electron

```bash
npm install --save-dev electron electron-builder
```

#### 2. Create Electron Main Process

Create `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false, // Remove window chrome
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // Load the built React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### 3. Update package.json

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "electron .",
    "electron:build": "electron-builder"
  },
  "build": {
    "appId": "com.paperengine.paperde",
    "productName": "PaperDE",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "category": "System"
    }
  }
}
```

#### 4. Build and Package

```bash
# Build React app
npm run build

# Package for Linux
npm run electron:build
```

### Option 2: Web Server (Kiosk Mode)

Run PaperDE as a web app in a kiosk browser.

#### 1. Build Static Files

```bash
npm run build
# Output will be in /dist
```

#### 2. Set Up Web Server

```bash
# Using nginx
sudo apt install nginx

# Copy dist to web root
sudo cp -r dist/* /var/www/paperde/

# Configure nginx
sudo nano /etc/nginx/sites-available/paperde
```

nginx config:

```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/paperde;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. Launch in Kiosk Mode

Create `/usr/local/bin/start-paperde.sh`:

```bash
#!/bin/bash
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  http://localhost
```

### Option 3: Custom Display Server

Integrate directly with Wayland/X11.

#### Install Tauri (Lightweight alternative to Electron)

```bash
# Add Tauri
npm install --save-dev @tauri-apps/cli
npx tauri init
```

Configure `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "PaperDE",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": true
    },
    "windows": [{
      "fullscreen": true,
      "decorations": false,
      "title": "PaperDE"
    }]
  }
}
```

Build:

```bash
npx tauri build
```

## 🚀 Auto-Start Configuration

### Systemd Service (For Login Manager)

Create `/etc/systemd/system/paperde.service`:

```ini
[Unit]
Description=PaperDE Desktop Environment
After=graphical.target

[Service]
Type=simple
User=%i
Environment=DISPLAY=:0
ExecStart=/usr/local/bin/paperde
Restart=always
RestartSec=3

[Install]
WantedBy=graphical.target
```

Enable:

```bash
sudo systemctl enable paperde
sudo systemctl start paperde
```

### XDG Autostart (User Session)

Create `~/.config/autostart/paperde.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=PaperDE
Exec=/usr/local/bin/paperde
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

### LightDM Integration

Create `/usr/share/xsessions/paperde.desktop`:

```ini
[Desktop Entry]
Name=PaperDE
Comment=Paper Desktop Environment
Exec=/usr/local/bin/paperde
Type=Application
DesktopNames=PaperDE
```

## 🔧 System Integration

### D-Bus Configuration

Create `/etc/dbus-1/system.d/paperde.conf`:

```xml
<!DOCTYPE busconfig PUBLIC "-//freedesktop//DTD D-BUS Bus Configuration 1.0//EN"
 "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
  <policy user="root">
    <allow own="org.paperde.System"/>
    <allow send_destination="org.paperde.System"/>
  </policy>
  
  <policy context="default">
    <allow send_destination="org.paperde.System"
           send_interface="org.paperde.System.Power"/>
  </policy>
</busconfig>
```

### PolicyKit Rules

Create `/etc/polkit-1/rules.d/50-paperde.rules`:

```javascript
polkit.addRule(function(action, subject) {
    if (action.id == "org.freedesktop.login1.power-off" &&
        subject.isInGroup("users")) {
        return polkit.Result.YES;
    }
});
```

## 📁 File Structure for Distribution

```
/usr/
├── bin/
│   └── paperde                    # Launch script
├── share/
│   ├── paperde/
│   │   ├── app/                   # Built React app
│   │   ├── assets/                # Icons, images
│   │   └── config/                # Default configs
│   ├── applications/
│   │   └── paperde.desktop        # Desktop entry
│   ├── xsessions/
│   │   └── paperde.desktop        # Session entry
│   └── icons/
│       └── hicolor/
│           └── 512x512/
│               └── apps/
│                   └── paperde.png
└── lib/
    └── paperde/
        └── plugins/               # Optional plugins
```

## 🎨 Branding

### Create Icon

Use `paper-icon.svg`:

```svg
<svg width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f5f1e8" rx="64"/>
  <rect x="64" y="64" width="384" height="384" fill="none" 
        stroke="#8b9dc3" stroke-width="4" opacity="0.3"/>
  <!-- Add your design -->
</svg>
```

Generate sizes:

```bash
for size in 16 32 48 64 128 256 512; do
  convert paper-icon.svg -resize ${size}x${size} paperde-${size}.png
done
```

### Splash Screen (Optional)

Create loading screen in `/dist/splash.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #f5f1e8;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui;
    }
    .splash {
      text-align: center;
    }
    .logo {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="splash">
    <div class="logo">📄</div>
    <h1>PaperDE</h1>
    <p>Loading...</p>
  </div>
</body>
</html>
```

## 🔐 Security Hardening

### AppArmor Profile

Create `/etc/apparmor.d/usr.bin.paperde`:

```
#include <tunables/global>

/usr/bin/paperde {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  #include <abstractions/X>

  /usr/share/paperde/** r,
  /home/*/.config/paperde/** rw,
  /tmp/** rw,

  # Deny access to sensitive files
  deny /etc/shadow r,
  deny /etc/sudoers r,
}
```

Enable:

```bash
sudo apparmor_parser -r /etc/apparmor.d/usr.bin.paperde
```

### Sandboxing with Flatpak

Create `org.paperde.PaperDE.yaml`:

```yaml
app-id: org.paperde.PaperDE
runtime: org.freedesktop.Platform
runtime-version: '23.08'
sdk: org.freedesktop.Sdk
command: paperde

finish-args:
  - --socket=x11
  - --socket=wayland
  - --device=dri
  - --share=ipc
  - --filesystem=home

modules:
  - name: paperde
    buildsystem: simple
    sources:
      - type: dir
        path: .
    build-commands:
      - npm install
      - npm run build
      - install -D dist/* /app/share/paperde/
```

Build:

```bash
flatpak-builder build org.paperde.PaperDE.yaml
```

## 📦 Distribution Packages

### Debian/Ubuntu (.deb)

Create DEBIAN control structure:

```
paperde_1.0-1/
├── DEBIAN/
│   ├── control
│   ├── postinst
│   └── prerm
└── usr/
    ├── bin/
    ├── share/
    └── lib/
```

`DEBIAN/control`:

```
Package: paperde
Version: 1.0-1
Section: x11
Priority: optional
Architecture: amd64
Depends: libc6
Maintainer: Your Name <you@example.com>
Description: Paper Desktop Environment
 A beautiful, minimalist desktop environment
```

Build:

```bash
dpkg-deb --build paperde_1.0-1
```

### Arch Linux (PKGBUILD)

```bash
pkgname=paperde
pkgver=1.0
pkgrel=1
pkgdesc="Paper Desktop Environment"
arch=('x86_64')
url="https://github.com/youruser/paperde"
license=('MIT')
depends=('nodejs')
makedepends=('npm')

build() {
  cd "$srcdir/$pkgname-$pkgver"
  npm install
  npm run build
}

package() {
  cd "$srcdir/$pkgname-$pkgver"
  install -Dm755 paperde "$pkgdir/usr/bin/paperde"
  cp -r dist/* "$pkgdir/usr/share/paperde/"
}
```

Build:

```bash
makepkg -si
```

## 🧪 Testing

### Integration Tests

```bash
# Test auto-start
systemctl --user start paperde

# Test display manager integration
sudo systemctl restart lightdm

# Test kiosk mode
./start-paperde.sh

# Check logs
journalctl -u paperde -f
```

### Performance Benchmarks

```bash
# Memory usage
ps aux | grep paperde

# CPU usage
top -p $(pgrep paperde)

# Load time
time curl http://localhost:5173
```

## 📊 Monitoring

Set up monitoring for production:

```bash
# System stats
cat /proc/meminfo | grep Available
cat /proc/loadavg

# Application logs
tail -f /var/log/paperde.log

# Crash reports
coredumpctl list paperde
```

---

**Your PaperDE is now production-ready! 🎉**
