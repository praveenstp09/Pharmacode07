import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const QuizTimer = ({ initialMinutes = 100, onTimeUp, onTick }) => {
  const { showToast } = useToast();
  const validMinutes = isNaN(initialMinutes) || initialMinutes <= 0 ? 100 : initialMinutes;
  const [secondsLeft, setSecondsLeft] = useState(validMinutes * 60);
  const warned5MinRef = useRef(false);
  const endTimeRef = useRef(Date.now() + validMinutes * 60 * 1000);
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTickRef.current = onTick;
  });

  useEffect(() => {
    endTimeRef.current = Date.now() + validMinutes * 60 * 1000;
    warned5MinRef.current = false;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      onTickRef.current?.(remaining);

      if (remaining <= 300 && remaining > 0 && !warned5MinRef.current && validMinutes > 5) {
        warned5MinRef.current = true;
        showToast('⏰ 5 Minutes Remaining! Please review your answers.', 'warning');
      }

      if (remaining <= 0) {
        clearInterval(timer);
        onTimeUpRef.current?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [validMinutes]);

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
