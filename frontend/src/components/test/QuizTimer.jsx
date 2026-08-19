import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const QuizTimer = ({ initialMinutes, onTimeUp, onTick }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (onTick) onTick(next);
        if (next <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const format = num => String(num).padStart(2, '0');

  const isUrgent = secondsLeft < 300; // less than 5 minutes

  return (
    <div
      className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-sm sm:text-base border shadow-sm transition-colors ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : 'text-blue-600'}`} />
      <span>
        {hours > 0 ? `${format(hours)}:` : ''}
        {format(minutes)}:{format(seconds)}
      </span>
    </div>
  );
};

export default QuizTimer;
