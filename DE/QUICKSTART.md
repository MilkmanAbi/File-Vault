# PaperDE Quick Start Guide

Get PaperDE up and running in your custom OS distribution in minutes!

## 🚀 Basic Setup

### 1. Install and Run

```bash
# Clone or copy PaperDE to your project
git clone <your-repo>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 2. Test the Default Experience

1. Open the app in your browser
2. Login with credentials: **Paper** / **Paper**
3. Toggle dark mode in **Settings → Appearance**
4. Try the included apps (Terminal, File Manager, Calculator, etc.)
5. Right-click desktop for context menu
6. Drag windows, resize them, and use the traffic lights

## 🔧 Integrating with Your OS

### Step 1: Power Management

Edit `/src/app/hooks/usePaperDE.ts`:

```tsx
export function usePowerManagement() {
  const shutdown = useCallback(async () => {
    // Replace with your OS shutdown command
    await exec('systemctl poweroff');
  }, []);

  const suspend = useCallback(async () => {
    await exec('systemctl suspend');
  }, []);

  const logout = useCallback(async () => {
    // Kill user session
    await exec('loginctl terminate-user $USER');
  }, []);

  return { shutdown, suspend, logout };
}
```

### Step 2: File System

```tsx
export function useFileSystem() {
  const readDirectory = useCallback(async (path: string) => {
    const fs = require('fs').promises;
    const files = await fs.readdir(path, { withFileTypes: true });
    
    return files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'folder' : 'file',
      // Add more metadata as needed
    }));
  }, []);

  // Implement createFile, deleteFile, moveFile similarly
  return { readDirectory, createFile, deleteFile, moveFile };
}
```

### Step 3: System Monitor

```tsx
export function useSystemMonitor() {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Read from /proc/stat for CPU
      const cpuData = await fs.readFile('/proc/stat', 'utf8');
      const cpu = parseCpuUsage(cpuData);
      setCpuUsage(cpu);

      // Read from /proc/meminfo for memory
      const memData = await fs.readFile('/proc/meminfo', 'utf8');
      const mem = parseMemoryUsage(memData);
      setMemoryUsage(mem);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { cpuUsage, memoryUsage, diskUsage };
}
```

### Step 4: Authentication (PAM)

```tsx
export function useAuthentication() {
  const authenticate = useCallback(async (username: string, password: string) => {
    // Use node-pam or similar
    const pam = require('node-pam');
    
    return new Promise((resolve) => {
      pam.authenticate(username, password, (err) => {
        resolve(!err);
      });
    });
  }, []);

  return { authenticate };
}
```

## 🎨 Customizing the Theme

### Change Colors

Edit `/src/app/context/ThemeContext.tsx` or create custom CSS variables in `/src/styles/theme.css`:

```css
:root {
  --paper-bg-light: #f5f1e8;
  --paper-bg-dark: #1a1a1a;
  --paper-accent: #8b9dc3;
  /* Add your custom colors */
}
```

### Modify Grid Pattern

In `Desktop.tsx` and `LoginScreen.tsx`, adjust the background grid:

```tsx
backgroundSize: '30px 30px',  // Larger grid
backgroundImage: `
  linear-gradient(#your-color 2px, transparent 2px),
  linear-gradient(90deg, #your-color 2px, transparent 2px)
`,
```

## 📱 Adding New Applications

### 1. Create App Component

Create `/src/app/components/apps/MyApp.tsx`:

```tsx
import { useTheme } from '../../context/ThemeContext';

export default function MyApp() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`w-full h-full p-6 ${
      isDarkMode ? 'bg-[#1f1f1f] text-[#d0d0d0]' : 'bg-[#fdfcfa] text-[#3a3a3a]'
    }`}>
      <h1>My App</h1>
      {/* Your app content */}
    </div>
  );
}
```

### 2. Register in Desktop

In `/src/app/components/Desktop.tsx`:

```tsx
import MyApp from './apps/MyApp';

const apps = [
  // ... existing apps
  { 
    id: 'myapp', 
    name: 'My App', 
    icon: '🚀', 
    component: MyApp 
  },
];
```

### 3. Add Icon to Dock

In `/src/app/components/Dock.tsx`:

```tsx
import { MyIcon } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  // ... existing icons
  myapp: <MyIcon className="w-6 h-6" />,
};
```

## 🐛 Common Issues

### Desktop icons not showing?
Check that `desktopItems` state is properly initialized in `Desktop.tsx`.

### Dark mode not persisting?
Theme is saved to `localStorage`. Check browser console for errors.

### Windows not dragging?
Ensure `onUpdatePosition` is properly passed through the Window component.

### Context menu not closing?
Make sure click handlers are properly stopping propagation.

## 🔐 Security Notes

When integrating with your OS:

1. **Validate all user input** before executing system commands
2. **Never run commands as root** unless absolutely necessary
3. **Sanitize file paths** to prevent directory traversal
4. **Use prepared statements** for any database operations
5. **Implement proper session management** for authentication

## 📊 Performance Tips

1. **Lazy load apps**: Only import app components when windows are opened
2. **Virtualize long lists**: Use virtual scrolling for file managers
3. **Debounce system stats**: Don't poll CPU/memory too frequently
4. **Optimize re-renders**: Use React.memo for heavy components

## 🎯 Next Steps

1. ✅ Get PaperDE running
2. ✅ Integrate with your OS hooks
3. ✅ Customize the theme
4. ✅ Add your custom apps
5. ⬜ Package for distribution
6. ⬜ Set up auto-start on boot
7. ⬜ Configure keyboard shortcuts
8. ⬜ Add multi-monitor support

## 💬 Need Help?

- Check `/src/app/hooks/README.md` for detailed hook documentation
- Review the main `/README.md` for architecture overview
- Look at existing apps for implementation examples

## 📝 Checklist for Production

- [ ] Replace mock data with real system calls
- [ ] Implement proper error handling
- [ ] Add logging for debugging
- [ ] Set up authentication properly (PAM)
- [ ] Configure file system permissions
- [ ] Test on target hardware
- [ ] Optimize for performance
- [ ] Set up crash reporting
- [ ] Document custom configurations
- [ ] Create installation scripts

---

**Happy coding! Build something amazing with PaperDE! 🎉**
