import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import TopBar from './TopBar';
import Dock from './Dock';
import Window from './Window';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import DesktopIcon from './DesktopIcon';
import Terminal from './apps/Terminal';
import SystemMonitor from './apps/SystemMonitor';
import FileManager from './apps/FileManager';
import Calculator from './apps/Calculator';
import Settings from './apps/Settings';
import TextEditor from './apps/TextEditor';
import AppLauncher from './apps/AppLauncher';
import { FolderOpen, FileText, Image, Trash2, Edit, Copy } from 'lucide-react';

interface WindowState {
  id: string;
  appId: string;
  title: string;
  component: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface DesktopItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image';
  icon: React.ReactNode;
  position: { x: number; y: number };
}

interface DesktopProps {
  onLogout: () => void;
}

export default function Desktop({ onLogout }: DesktopProps) {
  const { isDarkMode } = useTheme();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([
    { id: '1', name: 'Documents', type: 'folder', icon: <FolderOpen className="w-8 h-8" />, position: { x: 20, y: 20 } },
    { id: '2', name: 'README.txt', type: 'file', icon: <FileText className="w-8 h-8" />, position: { x: 20, y: 120 } },
    { id: '3', name: 'Pictures', type: 'folder', icon: <FolderOpen className="w-8 h-8" />, position: { x: 20, y: 220 } },
  ]);

  const apps = [
    { id: 'terminal', name: 'Terminal', icon: '>', component: Terminal },
    { id: 'monitor', name: 'System Monitor', icon: '📊', component: SystemMonitor },
    { id: 'files', name: 'Files', icon: '📁', component: FileManager },
    { id: 'calculator', name: 'Calculator', icon: '🔢', component: Calculator },
    { id: 'settings', name: 'Settings', icon: '⚙️', component: Settings },
    { id: 'editor', name: 'Text Editor', icon: '📝', component: TextEditor },
    { id: 'launcher', name: 'Applications', icon: '⊞', component: AppLauncher },
  ];

  const openApp = (appId: string, initialPath?: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const existingWindow = windows.find(w => w.appId === appId && !w.isMinimized);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }

    const minimizedWindow = windows.find(w => w.appId === appId && w.isMinimized);
    if (minimizedWindow) {
      setWindows(prev =>
        prev.map(w =>
          w.id === minimizedWindow.id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
        )
      );
      setNextZIndex(prev => prev + 1);
      setFocusedWindow(minimizedWindow.id);
      return;
    }

    const offset = windows.length * 30;
    const centerX = window.innerWidth / 2 - 400 + offset;
    const centerY = window.innerHeight / 2 - 300 + offset;

    // Create component with props based on app type
    let component: React.ReactNode;
    if (appId === 'files' && initialPath) {
      const FileManagerComponent = app.component as React.ComponentType<{ initialPath?: string }>;
      component = <FileManagerComponent initialPath={initialPath} />;
    } else {
      const AppComponent = app.component as React.ComponentType;
      component = <AppComponent />;
    }

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: app.name,
      component,
      position: { x: Math.max(50, centerX), y: Math.max(60, centerY) },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    setFocusedWindow(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (focusedWindow === id) {
      setFocusedWindow(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (focusedWindow === id) {
      setFocusedWindow(null);
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? {
              ...w,
              isMaximized: !w.isMaximized,
              position: !w.isMaximized ? { x: 0, y: 40 } : w.position,
              size: !w.isMaximized
                ? { width: window.innerWidth, height: window.innerHeight - 40 - 60 }
                : w.size,
            }
          : w
      )
    );
    bringToFront(id);
  };

  const bringToFront = (id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex(prev => prev + 1);
    setFocusedWindow(id);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, position } : w))
    );
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, size } : w))
    );
  };

  const handleDesktopClick = () => {
    if (contextMenu) {
      setContextMenu(null);
    }
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'New Folder',
          icon: <FolderOpen className="w-4 h-4" />,
          onClick: () => {
            const newFolder: DesktopItem = {
              id: Date.now().toString(),
              name: 'New Folder',
              type: 'folder',
              icon: <FolderOpen className="w-8 h-8" />,
              position: { x: e.clientX - 250, y: e.clientY - 100 },
            };
            setDesktopItems(prev => [...prev, newFolder]);
          },
        },
        {
          label: 'New File',
          icon: <FileText className="w-4 h-4" />,
          onClick: () => {
            const newFile: DesktopItem = {
              id: Date.now().toString(),
              name: 'New File.txt',
              type: 'file',
              icon: <FileText className="w-8 h-8" />,
              position: { x: e.clientX - 250, y: e.clientY - 100 },
            };
            setDesktopItems(prev => [...prev, newFile]);
          },
        },
        { label: '', divider: true, onClick: () => {} },
        {
          label: 'Open Terminal Here',
          onClick: () => openApp('terminal'),
        },
      ],
    });
  };

  const handleDesktopItemContextMenu = (e: React.MouseEvent, item: DesktopItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Open',
          onClick: () => {
            if (item.type === 'folder') {
              openApp('files', '/Desktop/' + item.name);
            } else {
              openApp('editor');
            }
          },
        },
        {
          label: 'Rename',
          icon: <Edit className="w-4 h-4" />,
          onClick: () => console.log('Rename', item.name),
        },
        {
          label: 'Copy',
          icon: <Copy className="w-4 h-4" />,
          onClick: () => console.log('Copy', item.name),
        },
        { label: '', divider: true, onClick: () => {} },
        {
          label: 'Delete',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => setDesktopItems(prev => prev.filter(i => i.id !== item.id)),
        },
      ],
    });
  };

  const focusedApp = windows.find(w => w.id === focusedWindow);

  return (
    <div
      className={`w-screen h-screen overflow-hidden relative ${
        isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#f5f1e8]'
      }`}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Paper Grid Background */}
      <div
        className={`absolute inset-0 ${isDarkMode ? 'opacity-10' : 'opacity-30'}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDarkMode ? '#404040' : '#d4cfc4'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDarkMode ? '#404040' : '#d4cfc4'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      <TopBar focusedApp={focusedApp?.title || null} onLogout={onLogout} />

      {/* Desktop Area */}
      <div className="absolute top-[40px] bottom-[60px] left-0 right-0">
        {/* Desktop Icons */}
        {desktopItems.map(item => (
          <DesktopIcon
            key={item.id}
            item={item}
            onDoubleClick={() => {
              if (item.type === 'folder') {
                openApp('files', '/Desktop/' + item.name);
              } else {
                openApp('editor');
              }
            }}
            onContextMenu={(e) => handleDesktopItemContextMenu(e, item)}
          />
        ))}

        {/* Windows */}
        {windows
          .filter(w => !w.isMinimized)
          .map(window => (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              position={window.position}
              size={window.size}
              zIndex={window.zIndex}
              isMaximized={window.isMaximized}
              isFocused={focusedWindow === window.id}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              onFocus={() => bringToFront(window.id)}
              onUpdatePosition={updateWindowPosition}
              onUpdateSize={updateWindowSize}
            >
              {window.component}
            </Window>
          ))}
      </div>

      <Dock apps={apps} onAppClick={openApp} openWindows={windows} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
