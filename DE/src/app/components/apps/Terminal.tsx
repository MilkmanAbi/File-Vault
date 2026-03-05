import { useState, useRef, useEffect } from 'react';

export default function Terminal() {
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    { command: '', output: 'PaperEngine Terminal v1.0.0\nType "help" for available commands.\n' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, string> = {
    help: 'Available commands:\n  help     - Show this help message\n  clear    - Clear terminal\n  date     - Show current date\n  echo     - Echo back text\n  neofetch - System information\n  about    - About PaperEngine',
    clear: '__CLEAR__',
    date: new Date().toString(),
    neofetch: `
     ██████╗  █████╗ ██████╗ ███████╗██████╗ 
     ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
     ██████╔╝███████║██████╔╝█████╗  ██████╔╝
     ██╔═══╝ ██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗
     ██║     ██║  ██║██║     ███████╗██║  ██║
     ╚═╝     ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝
     
     OS: PaperEngine
     DE: PaperDE v1.0
     Shell: PaperShell
     Theme: Minimal Paper
    `,
    about: 'PaperEngine - A minimalist paper-themed desktop environment\nBuilt with love for clean design and productivity.',
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
      setHistory(prev => [...prev, { command: '', output: '' }]);
      return;
    }

    const parts = trimmedCmd.split(' ');
    const baseCmd = parts[0];
    const args = parts.slice(1).join(' ');

    let output = '';

    if (baseCmd === 'clear') {
      setHistory([]);
      return;
    } else if (baseCmd === 'echo') {
      output = args || '';
    } else if (commands[baseCmd]) {
      output = commands[baseCmd];
    } else {
      output = `Command not found: ${baseCmd}\nType "help" for available commands.`;
    }

    setHistory(prev => [...prev, { command: trimmedCmd, output }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(currentCommand);
    setCurrentCommand('');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div 
      className="w-full h-full bg-[#1a1a1a] text-[#e8e8e8] font-mono text-sm p-4 overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={terminalRef} className="flex-1 overflow-y-auto mb-2">
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.command && (
              <div className="flex items-center gap-2 text-[#8fce8f]">
                <span className="text-[#8b9dc3]">paper@engine</span>
                <span className="text-[#999]">~</span>
                <span className="text-[#e8e8e8]">$</span>
                <span>{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <pre className="whitespace-pre-wrap text-[#d0d0d0] mt-1">{entry.output}</pre>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="text-[#8b9dc3]">paper@engine</span>
        <span className="text-[#999]">~</span>
        <span className="text-[#e8e8e8]">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[#e8e8e8]"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
}
