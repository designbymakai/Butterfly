import React, { createContext, useContext, useState, useEffect } from 'react';

type DateFormat = 'US' | 'EU';

interface SettingsContextProps {
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateFormat, setDateFormatState] = useState<DateFormat>(
    (localStorage.getItem('dateFormat') as DateFormat) || 'US'
  );

  const setDateFormat = (format: DateFormat) => {
    setDateFormatState(format);
    localStorage.setItem('dateFormat', format);
  };

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    const handler = () => {
      const stored = (localStorage.getItem('dateFormat') as DateFormat) || 'US';
      setDateFormatState(stored);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <SettingsContext.Provider value={{ dateFormat, setDateFormat }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};