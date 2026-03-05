import { useState } from 'react';
import { Search, Terminal, Activity, FolderOpen, Calculator, Settings, FileText, Grid3x3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const apps = [
  { id: 'terminal', name: 'Terminal', icon: Terminal, color: '#8b9dc3' },
  { id: 'monitor', name: 'System Monitor', icon: Activity, color: '#d4a5c3' },
  { id: 'files', name: 'Files', icon: FolderOpen, color: '#a5c3a5' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: '#c3b8a5' },
  { id: 'settings', name: 'Settings', icon: Settings, color: '#8b9dc3' },
  { id: 'editor', name: 'Text Editor', icon: FileText, color: '#d4a5c3' },
  { id: 'launcher', name: 'Applications', icon: Grid3x3, color: '#a5c3a5' },
];

export default function AppLauncher() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full h-full p-8 ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-[#fdfcfa]'}`}>
      <div className="max-w-3xl mx-auto">
        {/* Search */}
        <div className="relative mb-8">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-[#666]' : 'text-[#999]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-colors ${
              isDarkMode 
                ? 'bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#8b9dc3] text-[#d0d0d0] placeholder-[#666]'
                : 'bg-white border border-[#e8e4d9] focus:border-[#8b9dc3] text-[#3a3a3a]'
            }`}
          />
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-4 gap-6">
          {filteredApps.map(app => (
            <button
              key={app.id}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all group ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#faf8f3]'}`}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: app.color + '20' }}
              >
                <app.icon className="w-8 h-8" style={{ color: app.color }} />
              </div>
              <span className={`text-sm text-center ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{app.name}</span>
            </button>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#888]">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
