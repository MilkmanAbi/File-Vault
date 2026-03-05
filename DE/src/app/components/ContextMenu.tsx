import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const { isDarkMode } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${viewportWidth - rect.width - 10}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${viewportHeight - rect.height - 10}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className={`fixed rounded-lg shadow-2xl py-1 min-w-[180px] z-[9999] ${
        isDarkMode 
          ? 'bg-[#1f1f1f] border border-[#2a2a2a]' 
          : 'bg-[#fdfcfa] border border-[#e8e4d9]'
      }`}
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        item.divider ? (
          <div key={index} className={`h-px my-1 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-[#e8e4d9]'}`} />
        ) : (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-3
              ${item.disabled 
                ? isDarkMode ? 'text-[#555] cursor-not-allowed' : 'text-[#ccc] cursor-not-allowed'
                : isDarkMode 
                  ? 'text-[#d0d0d0] hover:bg-[#252525]' 
                  : 'text-[#3a3a3a] hover:bg-[#f5f1e8]'
              }
            `}
          >
            {item.icon && <span className="w-4">{item.icon}</span>}
            {item.label}
          </button>
        )
      ))}
    </div>
  );
}
