import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (username: string, password: string) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider>
      {isLoggedIn ? (
        <Desktop onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}
