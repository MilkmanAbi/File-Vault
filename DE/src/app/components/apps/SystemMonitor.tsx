import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SystemData {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

export default function SystemMonitor() {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState<SystemData[]>([
    { time: '0s', cpu: 23, memory: 45, disk: 12 },
    { time: '5s', cpu: 28, memory: 47, disk: 12 },
    { time: '10s', cpu: 31, memory: 46, disk: 13 },
    { time: '15s', cpu: 25, memory: 48, disk: 12 },
    { time: '20s', cpu: 35, memory: 49, disk: 14 },
  ]);

  const [currentStats, setCurrentStats] = useState({
    cpu: 32,
    memory: 48,
    disk: 65,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newCpu = Math.floor(Math.random() * 40) + 20;
      const newMemory = Math.floor(Math.random() * 10) + 45;
      const newDisk = Math.floor(Math.random() * 5) + 63;

      setCurrentStats({ cpu: newCpu, memory: newMemory, disk: newDisk });

      setData(prev => {
        const newData = [...prev.slice(1), {
          time: `${prev.length * 5}s`,
          cpu: newCpu,
          memory: newMemory,
          disk: newDisk,
        }];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full h-full p-6 overflow-y-auto ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-[#fdfcfa]'}`}>
      <h2 className={`text-xl font-medium mb-6 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>System Monitor</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-[#8b9dc3]" />
            <span className={`text-sm ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`}>CPU Usage</span>
          </div>
          <div className={`text-3xl font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{currentStats.cpu}%</div>
          <div className="text-xs text-[#888] mt-1">4 cores @ 2.4GHz</div>
        </div>

        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-[#d4a5c3]" />
            <span className={`text-sm ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`}>Memory</span>
          </div>
          <div className={`text-3xl font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{currentStats.memory}%</div>
          <div className="text-xs text-[#888] mt-1">7.8 GB / 16 GB</div>
        </div>

        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-5 h-5 text-[#a5c3a5]" />
            <span className={`text-sm ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#5a5a5a]'}`}>Disk Usage</span>
          </div>
          <div className={`text-3xl font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{currentStats.disk}%</div>
          <div className="text-xs text-[#888] mt-1">325 GB / 512 GB</div>
        </div>
      </div>

      {/* CPU Chart */}
      <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
        <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>CPU Usage Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b9dc3" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b9dc3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2a2a2a' : '#e8e4d9'} />
            <XAxis dataKey="time" stroke={isDarkMode ? '#666' : '#999'} style={{ fontSize: '12px' }} />
            <YAxis stroke={isDarkMode ? '#666' : '#999'} style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                background: isDarkMode ? '#1a1a1a' : '#fdfcfa', 
                border: `1px solid ${isDarkMode ? '#2a2a2a' : '#e8e4d9'}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: isDarkMode ? '#d0d0d0' : '#3a3a3a'
              }} 
            />
            <Area type="monotone" dataKey="cpu" stroke="#8b9dc3" strokeWidth={2} fill="url(#cpuGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Memory Chart */}
      <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
        <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>Memory Usage Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2a2a2a' : '#e8e4d9'} />
            <XAxis dataKey="time" stroke={isDarkMode ? '#666' : '#999'} style={{ fontSize: '12px' }} />
            <YAxis stroke={isDarkMode ? '#666' : '#999'} style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                background: isDarkMode ? '#1a1a1a' : '#fdfcfa', 
                border: `1px solid ${isDarkMode ? '#2a2a2a' : '#e8e4d9'}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: isDarkMode ? '#d0d0d0' : '#3a3a3a'
              }} 
            />
            <Line type="monotone" dataKey="memory" stroke="#d4a5c3" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
