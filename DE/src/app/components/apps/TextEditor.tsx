import { useState } from 'react';
import { Save, FileText, FolderOpen, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function TextEditor() {
  const { isDarkMode } = useTheme();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled');

  return (
    <div className={`w-full h-full flex flex-col ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-[#fdfcfa]'}`}>
      {/* Toolbar */}
      <div className={`h-12 flex items-center justify-between px-4 ${isDarkMode ? 'bg-[#1a1a1a] border-b border-[#2a2a2a]' : 'bg-[#faf8f3] border-b border-[#e8e4d9]'}`}>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${isDarkMode ? 'text-[#b0b0b0] hover:bg-[#252525]' : 'text-[#5a5a5a] hover:bg-[#ebe8dd]'}`}>
            <FolderOpen className="w-4 h-4" />
            Open
          </button>
          <button className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${isDarkMode ? 'text-[#b0b0b0] hover:bg-[#252525]' : 'text-[#5a5a5a] hover:bg-[#ebe8dd]'}`}>
            <Save className="w-4 h-4" />
            Save
          </button>
          <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-[#e8e4d9]'}`} />
          <button className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <Type className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
          </button>
          <button className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <AlignLeft className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
          </button>
          <button className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <AlignCenter className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
          </button>
          <button className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <AlignRight className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#888]">
          <FileText className="w-4 h-4" />
          <span>{fileName}.txt</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing..."
          className={`w-full h-full p-6 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed ${isDarkMode ? 'text-[#d0d0d0] placeholder-[#666]' : 'text-[#3a3a3a]'}`}
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className={`h-8 flex items-center justify-between px-4 text-xs text-[#888] ${isDarkMode ? 'bg-[#1a1a1a] border-t border-[#2a2a2a]' : 'bg-[#faf8f3] border-t border-[#e8e4d9]'}`}>
        <div className="flex items-center gap-4">
          <span>Lines: {content.split('\n').length}</span>
          <span>Words: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
          <span>Characters: {content.length}</span>
        </div>
        <div>Plain Text</div>
      </div>
    </div>
  );
}
