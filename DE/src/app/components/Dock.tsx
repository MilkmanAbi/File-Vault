import { Terminal, Activity, FolderOpen, Calculator, Settings, FileText, Grid3x3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DockProps {
  apps: Array<{ id: string; name: string; icon: string }>;
  onAppClick: (appId: string) => void;
  openWindows: Array<{ appId: string; isMinimized: boolean }>;
}

const iconMap: Record<string, React.ReactNode> = {
  terminal: <Terminal className="w-6 h-6" />,
  monitor: <Activity className="w-6 h-6" />,
  files: <FolderOpen className="w-6 h-6" />,
  calculator: <Calculator className="w-6 h-6" />,
  settings: <Settings className="w-6 h-6" />,
  editor: <FileText className="w-6 h-6" />,
  launcher: <Grid3x3 className="w-6 h-6" />,
};

export default function Dock({ apps, onAppClick, openWindows }: DockProps) {
  const { isDarkMode } = useTheme();

  const isAppOpen = (appId: string) => {
    return openWindows.some(w => w.appId === appId && !w.isMinimized);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-[60px] backdrop-blur-sm flex items-center justify-center gap-2 px-4 ${
        isDarkMode
          ? 'bg-[#1f1f1f]/95 border-t border-[#2a2a2a]'
          : 'bg-[#faf8f3]/95 border-t border-[#e8e4d9]'
      }`}
    >
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => onAppClick(app.id)}
          className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm ${
            isDarkMode
              ? 'bg-[#2a2a2a] hover:bg-[#333] border border-[#404040]'
              : 'bg-[#ffffff] hover:bg-[#f0ede3] border border-[#e8e4d9]'
          }`}
          title={app.name}
        >
          <div className={isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}>
            {iconMap[app.id]}
          </div>
          {isAppOpen(app.id) && (
            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#8b9dc3]" />
          )}
        </button>
      ))}
    </div>
  );
}
