import { useState } from 'react';
import { 
  Wifi, 
  Bluetooth, 
  Bell, 
  Palette, 
  Monitor, 
  Volume2, 
  Lock, 
  User,
  ChevronRight 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}

export default function Settings() {
  const { isDarkMode, setDarkMode } = useTheme();
  const [selectedSection, setSelectedSection] = useState<string>('appearance');

  const settingsSections: SettingItem[] = [
    {
      id: 'wifi',
      icon: <Wifi className="w-6 h-6" />,
      title: 'Wi-Fi',
      subtitle: 'Connected to "Home Network"',
      badge: 'Connected',
    },
    {
      id: 'bluetooth',
      icon: <Bluetooth className="w-6 h-6" />,
      title: 'Bluetooth',
      subtitle: '3 devices connected',
    },
    {
      id: 'notifications',
      icon: <Bell className="w-6 h-6" />,
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
    },
    {
      id: 'appearance',
      icon: <Palette className="w-6 h-6" />,
      title: 'Appearance',
      subtitle: 'Customize theme and colors',
    },
    {
      id: 'display',
      icon: <Monitor className="w-6 h-6" />,
      title: 'Display',
      subtitle: 'Resolution and scaling',
    },
    {
      id: 'sound',
      icon: <Volume2 className="w-6 h-6" />,
      title: 'Sound',
      subtitle: 'Volume and audio devices',
    },
    {
      id: 'privacy',
      icon: <Lock className="w-6 h-6" />,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
    },
    {
      id: 'accounts',
      icon: <User className="w-6 h-6" />,
      title: 'Users & Accounts',
      subtitle: 'Manage user accounts',
    },
  ];

  return (
    <div className={`w-full h-full flex ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-[#fdfcfa]'}`}>
      {/* Sidebar */}
      <div className={`w-64 overflow-y-auto ${isDarkMode ? 'bg-[#1a1a1a] border-r border-[#2a2a2a]' : 'bg-[#faf8f3] border-r border-[#e8e4d9]'}`}>
        <div className="p-4">
          <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Settings</h2>
          <div className="space-y-1">
            {settingsSections.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left
                  ${selectedSection === section.id 
                    ? isDarkMode
                      ? 'bg-[#2a2a2a] border border-[#404040]' 
                      : 'bg-white border border-[#e8e4d9]'
                    : isDarkMode
                    ? 'hover:bg-[#252525]'
                    : 'hover:bg-[#ebe8dd]'
                  }
                `}
              >
                <div className={isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}>{section.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{section.title}</div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-[#666]' : 'text-[#999]'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedSection && (
          <div>
            {settingsSections.find(s => s.id === selectedSection) && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}>
                    {settingsSections.find(s => s.id === selectedSection)?.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>
                      {settingsSections.find(s => s.id === selectedSection)?.title}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-[#888]' : 'text-[#888]'}`}>
                      {settingsSections.find(s => s.id === selectedSection)?.subtitle}
                    </p>
                  </div>
                </div>

                {/* Setting Content */}
                <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
                  <div className="space-y-6">
                    {selectedSection === 'appearance' && (
                      <>
                        <div>
                          <label className={`text-sm font-medium block mb-3 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>
                            Theme
                          </label>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setDarkMode(false)}
                              className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors ${
                                !isDarkMode
                                  ? 'bg-[#f5f1e8] border-2 border-[#8b9dc3]'
                                  : isDarkMode
                                  ? 'bg-[#252525] border border-[#404040] hover:bg-[#2a2a2a]'
                                  : 'bg-white border border-[#e8e4d9] hover:bg-[#faf8f3]'
                              }`}
                            >
                              ☀️ Light
                            </button>
                            <button
                              onClick={() => setDarkMode(true)}
                              className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors ${
                                isDarkMode
                                  ? 'bg-[#2a2a2a] border-2 border-[#8b9dc3]'
                                  : 'bg-white border border-[#e8e4d9] hover:bg-[#faf8f3]'
                              }`}
                            >
                              🌙 Dark
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={`text-sm font-medium block mb-3 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>
                            Accent Color
                          </label>
                          <div className="flex gap-2">
                            {['#8b9dc3', '#d4a5c3', '#a5c3a5', '#c3b8a5'].map(color => (
                              <button
                                key={color}
                                className="w-10 h-10 rounded-lg border-2 border-[#e8e4d9] hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedSection !== 'appearance' && (
                      <p className={`text-sm ${isDarkMode ? 'text-[#888]' : 'text-[#888]'}`}>
                        Settings for {settingsSections.find(s => s.id === selectedSection)?.title} will appear here.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
