import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface WindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMaximized: boolean;
  isFocused: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateSize: (id: string, size: { width: number; height: number }) => void;
}

export default function Window({
  id,
  title,
  position,
  size,
  zIndex,
  isMaximized,
  isFocused,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
}: WindowProps) {
  const { isDarkMode } = useTheme();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    
    onFocus();
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    setResizeDirection(direction);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialSize.current = { ...size };
    initialPos.current = { ...position };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        onUpdatePosition(id, {
          x: Math.max(0, Math.min(newX, window.innerWidth - size.width)),
          y: Math.max(40, Math.min(newY, window.innerHeight - 60 - 40)),
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        let newWidth = initialSize.current.width;
        let newHeight = initialSize.current.height;
        let newX = initialPos.current.x;
        let newY = initialPos.current.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(400, initialSize.current.width + deltaX);
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(300, initialSize.current.height + deltaY);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(400, initialSize.current.width - deltaX);
          newX = initialPos.current.x + (initialSize.current.width - newWidth);
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(300, initialSize.current.height - deltaY);
          newY = initialPos.current.y + (initialSize.current.height - newHeight);
        }

        onUpdateSize(id, { width: newWidth, height: newHeight });
        if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
          onUpdatePosition(id, { x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, id, position, size, isMaximized, resizeDirection, onUpdatePosition, onUpdateSize]);

  return (
    <div
      ref={windowRef}
      className={`absolute rounded-xl shadow-2xl flex flex-col overflow-hidden ${
        isDarkMode
          ? 'bg-[#1f1f1f] border border-[#2a2a2a]'
          : 'bg-[#fdfcfa] border border-[#e8e4d9]'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        boxShadow: isFocused 
          ? isDarkMode
            ? '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,157,195,0.3)'
            : '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(139,157,195,0.2)' 
          : isDarkMode
          ? '0 10px 30px rgba(0,0,0,0.4)'
          : '0 10px 30px rgba(0,0,0,0.08)',
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className={`h-9 flex items-center justify-between px-4 cursor-move select-none ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#1f1f1f] to-[#1a1a1a] border-b border-[#2a2a2a]'
            : 'bg-gradient-to-b from-[#fdfcfa] to-[#faf8f3] border-b border-[#e8e4d9]'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-2 window-controls">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ec8f8f] hover:bg-[#e67373] transition-colors"
          />
          <button
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-[#f5d273] hover:bg-[#f3c85a] transition-colors"
          />
          <button
            onClick={onMaximize}
            className="w-3 h-3 rounded-full bg-[#8fce8f] hover:bg-[#73c373] transition-colors"
          />
        </div>

        {/* Title */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 text-sm font-medium ${
            isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'
          }`}
        >
          {title}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Resize Handles */}
      {!isMaximized && (
        <>
          {/* Corners */}
          <div
            className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* Edges */}
          <div
            className="resize-handle absolute top-0 left-3 right-3 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="resize-handle absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="resize-handle absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
}
