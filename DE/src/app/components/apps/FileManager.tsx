import { useState } from 'react';
import { Folder, File, Home, Image, Music, Video, FileText, Download, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: string;
  size?: string;
  modified?: string;
}

interface FileManagerProps {
  initialPath?: string;
}

export default function FileManager({ initialPath = 'Home' }: FileManagerProps) {
  const { isDarkMode } = useTheme();
  const [currentPath, setCurrentPath] = useState([initialPath]);
  const [files] = useState<FileItem[]>([
    { id: '1', name: 'Documents', type: 'folder', icon: 'folder' },
    { id: '2', name: 'Pictures', type: 'folder', icon: 'folder' },
    { id: '3', name: 'Music', type: 'folder', icon: 'folder' },
    { id: '4', name: 'Videos', type: 'folder', icon: 'folder' },
    { id: '5', name: 'Downloads', type: 'folder', icon: 'folder' },
    { id: '6', name: 'notes.txt', type: 'file', icon: 'text', size: '2.4 KB', modified: '2 hours ago' },
    { id: '7', name: 'project.pdf', type: 'file', icon: 'file', size: '1.2 MB', modified: '1 day ago' },
    { id: '8', name: 'vacation.jpg', type: 'file', icon: 'image', size: '3.8 MB', modified: '3 days ago' },
  ]);

  const getIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-5 h-5 text-[#8b9dc3]" />;
    }
    switch (item.icon) {
      case 'text':
        return <FileText className="w-5 h-5 text-[#a5c3a5]" />;
      case 'image':
        return <Image className="w-5 h-5 text-[#d4a5c3]" />;
      case 'music':
        return <Music className="w-5 h-5 text-[#c3b8a5]" />;
      case 'video':
        return <Video className="w-5 h-5 text-[#a5b8c3]" />;
      default:
        return <File className="w-5 h-5 text-[#888]" />;
    }
  };

  return (
    <div className={`w-full h-full flex ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-[#fdfcfa]'}`}>
      {/* Sidebar */}
      <div className={`w-48 p-4 ${isDarkMode ? 'bg-[#1a1a1a] border-r border-[#2a2a2a]' : 'bg-[#faf8f3] border-r border-[#e8e4d9]'}`}>
        <div className="space-y-1">
          <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <Home className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Home</span>
          </button>
          <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <Download className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Downloads</span>
          </button>
          <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <FileText className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Documents</span>
          </button>
          <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <Image className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Pictures</span>
          </button>
          <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#ebe8dd]'}`}>
            <Music className={`w-4 h-4 ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Music</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Path Bar */}
        <div className={`h-12 flex items-center px-4 gap-1 ${isDarkMode ? 'border-b border-[#2a2a2a]' : 'border-b border-[#e8e4d9]'}`}>
          {currentPath.map((path, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-[#666]' : 'text-[#999]'}`} />}
              <span className={`text-sm ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{path}</span>
            </div>
          ))}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-1">
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                  isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#f5f1e8]'
                }`}
              >
                {getIcon(file)}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{file.name}</div>
                  {file.size && (
                    <div className="text-xs text-[#888]">
                      {file.size} • {file.modified}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
