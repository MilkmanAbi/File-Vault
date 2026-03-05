# PaperEngine / PaperDE

A beautiful, minimalist, paper-themed desktop environment built with React and Tailwind CSS. Designed for clean aesthetics and smooth productivity.

![PaperEngine](https://img.shields.io/badge/PaperEngine-v1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Desktop Environment
- **Paper-Themed Design**: Clean beige/cream color palette with subtle grid patterns
- **Dark Mode Support**: Beautiful dark theme with dark paper background
- **macOS-Style Window Management**: Draggable, resizable windows with traffic light controls
- **Desktop Icons**: Drag files and folders to your desktop
- **Right-Click Context Menus**: Quick access to common actions
- **Smart Window Stacking**: Automatic z-index management and window centering

### Included Applications
1. **Terminal** - Full-featured terminal with PaperEngine branding
2. **System Monitor** - Real-time CPU, memory, and disk usage with live charts
3. **File Manager** - Browse your files with sidebar navigation
4. **Calculator** - Clean calculator with all basic operations
5. **Settings** - System settings with theme switcher
6. **Text Editor** - Minimal text editor with word/character count
7. **App Launcher** - Grid view of all applications with search

### Login Experience
- Beautiful login screen with live clock
- Default credentials: `Paper` / `Paper`
- GNOME-inspired clean design

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## 🎨 Theme Customization

PaperDE supports both light and dark themes. Toggle between them in **Settings → Appearance**.

### Light Theme
- Background: `#f5f1e8` (warm beige)
- Foreground: `#fdfcfa` (off-white)
- Text: `#3a3a3a` (soft black)
- Accent: `#8b9dc3` (soft blue)

### Dark Theme
- Background: `#1a1a1a` (deep black)
- Foreground: `#1f1f1f` (charcoal)
- Text: `#d0d0d0` (soft white)
- Grid: `#404040` (dark gray)

## 🔧 Integration with Your OS

PaperDE includes hooks for integrating with your custom operating system. See `/src/app/hooks/README.md` for detailed documentation.

### Quick Integration Example

```tsx
import { usePowerManagement, useFileSystem } from './hooks/usePaperDE';

function MyComponent() {
  const { shutdown, suspend } = usePowerManagement();
  const { readDirectory } = useFileSystem();

  // Now integrate with your OS APIs
  const handleShutdown = async () => {
    await shutdown(); // Replace with actual systemctl call
  };
}
```

### Available Hooks
- `usePowerManagement()` - System power controls (shutdown, suspend, reboot, logout)
- `useFileSystem()` - File operations (read, create, delete, move)
- `useSystemMonitor()` - Real-time system stats (CPU, memory, disk)
- `useAuthentication()` - User authentication (PAM integration ready)
- `useNetworkManager()` - Network management (NetworkManager D-Bus ready)

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── apps/           # All desktop applications
│   │   ├── ContextMenu.tsx # Right-click menus
│   │   ├── Desktop.tsx     # Main desktop component
│   │   ├── DesktopIcon.tsx # Desktop file/folder icons
│   │   ├── Dock.tsx        # Bottom app dock
│   │   ├── LoginScreen.tsx # Login interface
│   │   ├── TopBar.tsx      # Top system bar
│   │   └── Window.tsx      # Window manager
│   ├── context/
│   │   └── ThemeContext.tsx # Dark/light theme state
│   ├── hooks/
│   │   ├── usePaperDE.ts   # OS integration hooks
│   │   └── README.md       # Hooks documentation
│   └── App.tsx             # Main app entry
└── styles/
    ├── fonts.css
    ├── index.css
    ├── tailwind.css
    └── theme.css
```

## 🎯 Roadmap

- [ ] Virtual desktop/workspace support
- [ ] Window tiling modes
- [ ] Notification system
- [ ] System tray applets
- [ ] Keyboard shortcuts configuration
- [ ] Application menu in top bar
- [ ] File manager thumbnail previews
- [ ] Terminal tab support
- [ ] Settings persistence
- [ ] Multi-monitor support

## 🤝 Contributing

Contributions are welcome! PaperDE is designed to be a base for custom operating systems and desktop environments.

### Areas for Contribution
- OS-specific integrations (systemd, PAM, D-Bus, etc.)
- New applications
- Theme improvements
- Performance optimizations
- Documentation

## 📝 License

MIT License - feel free to use PaperDE in your custom OS distribution!

## 🙏 Credits

Built with:
- React 18
- Tailwind CSS v4
- Lucide Icons
- Recharts
- Framer Motion (motion)

Inspired by:
- macOS's clean window management
- GNOME's login screen
- iOS's settings design
- Paper texture aesthetics

## 💡 Philosophy

PaperDE follows these principles:
- **Minimalism**: Remove everything unnecessary
- **Paper Aesthetic**: Warm, gentle colors inspired by real paper
- **Productivity**: Fast, smooth, distraction-free
- **Extensibility**: Easy to customize and integrate

---

**Made with ❤️ for clean design and minimal computing**
