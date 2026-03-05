import { useTheme } from '../context/ThemeContext';

interface DesktopItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image';
  icon: React.ReactNode;
  position: { x: number; y: number };
}

interface DesktopIconProps {
  item: DesktopItem;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function DesktopIcon({ item, onDoubleClick, onContextMenu }: DesktopIconProps) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`absolute flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer select-none group ${
        isDarkMode ? 'hover:bg-[#2a2a2a]/80' : 'hover:bg-white/60'
      }`}
      style={{ left: item.position.x, top: item.position.y }}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className={`${isDarkMode ? 'text-[#8b9dc3]' : 'text-[#5a5a5a]'}`}>
        {item.icon}
      </div>
      <div
        className={`text-xs text-center px-2 py-0.5 rounded max-w-[80px] truncate ${
          isDarkMode
            ? 'text-white bg-[#1a1a1a]/80 group-hover:bg-[#2a2a2a]'
            : 'text-[#3a3a3a] bg-[#f5f1e8]/80 group-hover:bg-white'
        }`}
      >
        {item.name}
      </div>
    </div>
  );
}
