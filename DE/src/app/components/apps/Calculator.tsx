import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Calculator() {
  const { isDarkMode } = useTheme();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
        default:
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handleClick = (btn: string) => {
    if (btn >= '0' && btn <= '9') {
      inputDigit(btn);
    } else if (btn === '.') {
      inputDecimal();
    } else if (btn === 'C') {
      clear();
    } else if (btn === '=') {
      performOperation('=');
      setOperation(null);
      setWaitingForOperand(false);
    } else if (['+', '-', '×', '÷'].includes(btn)) {
      performOperation(btn);
    } else if (btn === '±') {
      setDisplay(String(parseFloat(display) * -1));
    } else if (btn === '%') {
      setDisplay(String(parseFloat(display) / 100));
    }
  };

  return (
    <div className={`w-full h-full p-6 flex items-center justify-center ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-[#fdfcfa]'}`}>
      <div className="w-80">
        {/* Display */}
        <div className={`rounded-lg p-6 mb-4 text-right ${isDarkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e8e4d9]'}`}>
          <div className={`text-4xl font-light truncate ${isDarkMode ? 'text-[#d0d0d0]' : 'text-[#3a3a3a]'}`}>
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: row.length === 3 ? '2fr 1fr 1fr' : 'repeat(4, 1fr)' }}>
              {row.map(btn => (
                <button
                  key={btn}
                  onClick={() => handleClick(btn)}
                  className={`
                    h-14 rounded-lg font-medium text-lg transition-all
                    ${btn === '=' 
                      ? 'bg-[#8b9dc3] text-white hover:bg-[#7a8eb5]' 
                      : ['+', '-', '×', '÷'].includes(btn)
                      ? isDarkMode
                        ? 'bg-[#252525] text-[#b0b0b0] hover:bg-[#2a2a2a]'
                        : 'bg-[#f5f1e8] text-[#5a5a5a] hover:bg-[#ebe8dd]'
                      : isDarkMode
                      ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#d0d0d0] hover:bg-[#252525]'
                      : 'bg-white border border-[#e8e4d9] text-[#3a3a3a] hover:bg-[#faf8f3]'
                    }
                  `}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
