import { useState, useEffect } from 'react';
import { Power, Moon, LogOut, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  focusedApp: string | null;
  onLogout: () => void;
}

export default function TopBar({ focusedApp, onLogout }: TopBarProps) {
  const { isDarkMode } = useTheme();
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const handleClickOutside = () => {
      setShowPowerMenu(false);
      setShowNotifications(false);
    };

    if (showPowerMenu || showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPowerMenu, showNotifications]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = now.toLocaleString('en', { month: 'short' });
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${day} ${month} ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`h-10 flex items-center justify-between px-4 relative z-50 ${
        isDarkMode
          ? 'bg-[#1f1f1f] border-b border-[#2a2a2a]'
          : 'bg-[#faf8f3] border-b border-[#e8e4d9]'
      }`}
    >
      {/* Left Section */}
      <div
        className={`flex items-center gap-3 text-sm ${
          isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'
        }`}
      >
        <span className={`font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>
          PaperDE
        </span>
        <span className={isDarkMode ? 'text-[#555]' : 'text-[#a0a0a0]'}>|</span>
        <span>Applications</span>
        {focusedApp && (
          <>
            <span className={isDarkMode ? 'text-[#555]' : 'text-[#a0a0a0]'}>|</span>
            <span className={isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}>{focusedApp}</span>
          </>
        )}
      </div>

      {/* Center Section - Time */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 text-sm font-medium ${
          isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'
        }`}
      >
        {currentTime}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setShowPowerMenu(false);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#ebe8dd]'
            }`}
          >
            <Bell className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg p-3 ${
                isDarkMode
                  ? 'bg-[#1f1f1f] border border-[#2a2a2a]'
                  : 'bg-[#faf8f3] border border-[#e8e4d9]'
              }`}
            >
              <div
                className={`text-xs font-medium mb-2 ${
                  isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'
                }`}
              >
                Notifications
              </div>
              <div
                className={`text-xs text-center py-4 ${
                  isDarkMode ? 'text-[#888]' : 'text-[#888]'
                }`}
              >
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Power Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPowerMenu(!showPowerMenu);
              setShowNotifications(false);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#ebe8dd]'
            }`}
          >
            <Power className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
          </button>

          {showPowerMenu && (
            <div
              className={`absolute right-0 top-full mt-2 w-40 rounded-lg shadow-lg overflow-hidden ${
                isDarkMode
                  ? 'bg-[#1f1f1f] border border-[#2a2a2a]'
                  : 'bg-[#faf8f3] border border-[#e8e4d9]'
              }`}
            >
              <button
                onClick={() => console.log('Suspend')}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                  isDarkMode
                    ? 'text-[#b0b0b0] hover:bg-[#2a2a2a]'
                    : 'text-[#5a5a5a] hover:bg-[#ebe8dd]'
                }`}
              >
                <Moon className="w-4 h-4" />
                Suspend
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setShowPowerMenu(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                  isDarkMode
                    ? 'text-[#b0b0b0] hover:bg-[#2a2a2a]'
                    : 'text-[#5a5a5a] hover:bg-[#ebe8dd]'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
              <button
                onClick={() => console.log('Shutdown')}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                  isDarkMode
                    ? 'text-[#d45a5a] hover:bg-[#2a2a2a]'
                    : 'text-[#d45a5a] hover:bg-[#ebe8dd]'
                }`}
              >
                <Power className="w-4 h-4" />
                Shutdown
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
