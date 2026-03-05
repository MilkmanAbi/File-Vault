import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { isDarkMode } = useTheme();
  const [username, setUsername] = useState('Paper');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'Paper' && password === 'Paper') {
      onLogin(username, password);
    } else {
      setError('Invalid username or password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#f5f1e8]'}`}>
      {/* Paper Grid Background */}
      <div 
        className={`absolute inset-0 ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDarkMode ? '#404040' : '#d4cfc4'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDarkMode ? '#404040' : '#d4cfc4'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Time Display */}
      <div className="absolute top-12 left-0 right-0 text-center">
        <div className={`text-7xl font-light mb-2 ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{currentTime}</div>
        <div className="text-lg text-[#888]">{currentDate}</div>
      </div>

      {/* Login Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96">
        <div className={`rounded-2xl shadow-2xl overflow-hidden transition-transform ${
          isShaking ? 'animate-shake' : ''
        } ${
          isDarkMode 
            ? 'bg-[#1f1f1f] border border-[#2a2a2a]' 
            : 'bg-[#fdfcfa] border border-[#e8e4d9]'
        }`}>
          {/* User Avatar */}
          <div className="pt-8 pb-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b9dc3] to-[#a5c3a5] flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className={`text-xl font-medium ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>{username}</div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="relative mb-4">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-[#666]' : 'text-[#999]'}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#8b9dc3] transition-colors ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#d0d0d0] placeholder-[#666]'
                    : 'bg-[#faf8f3] border border-[#e8e4d9] text-[#3a3a3a]'
                }`}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-[#d45a5a] mb-4 text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#8b9dc3] text-white rounded-xl hover:bg-[#7a8eb5] transition-colors font-medium"
            >
              Log In
            </button>

            <div className="mt-4 text-center text-xs text-[#888]">
              Hint: Password is "Paper"
            </div>
          </form>
        </div>
      </div>

      {/* PaperEngine Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-[#888]">
        PaperEngine v1.0
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-10px); }
          75% { transform: translate(-50%, -50%) translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
