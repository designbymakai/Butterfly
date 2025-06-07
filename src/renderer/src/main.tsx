import './assets/main.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure this line is included
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Define types for window.api
interface WindowApi {
  fetchOpenAIResponse?: (message: string) => Promise<string>;
  fetchWeather?: () => Promise<string>;
}

declare global {
  interface Window {
    api: WindowApi;
  }
}

// Use contextBridge
if (window.api && window.api.fetchOpenAIResponse) {
  window.api.fetchOpenAIResponse('Hello').then(response => {
    console.log(response);
  });
}

if (window.api && window.api.fetchWeather) {
  window.api.fetchWeather().then(weather => {
    console.log(weather);
  });
}

if (window.electron && window.electron.ipcRenderer) {
  window.electron.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
  });
}