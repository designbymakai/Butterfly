import { useState, useEffect, useRef } from 'react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="pomodoro-timer">
      <h2 className="text-center text-2xl mb-4">Pomodoro Timer</h2>
      <div className="timer-display text-center text-4xl mb-4">
        {formatTime(timeLeft)}
      </div>
      <div className="timer-controls text-center">
        <button onClick={handleStartPause} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded">
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;