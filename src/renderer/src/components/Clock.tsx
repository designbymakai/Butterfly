// src/renderer/src/components/Clock.tsx
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-b-blue-100 rounded-lg shadow-lg">
      <div className="text-b-white-100 text-4xl font-bold">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div>
      <div className="text-b-white-200 text-lg">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

export default Clock;