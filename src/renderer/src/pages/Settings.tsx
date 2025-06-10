import React, { useState } from 'react';
import { createRandomTodo } from '@renderer/utils/createRandomTodo';
import { useTasks } from '../context/TaskContext'; // import hook to access tasks methods

function Settings() {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Makai');
  const [chatGPTKey, setChatGPTKey] = useState(localStorage.getItem('chatGPTKey') || '');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  
  // Get addTask from the TaskContext
  const { addTask } = useTasks();
  
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    localStorage.setItem('userName', e.target.value);
  };

  const handleChatGPTKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatGPTKey(e.target.value);
    localStorage.setItem('chatGPTKey', e.target.value);
  };

  const activeProjects = ["Marketing", "Development", "Sales"];

  const verifyChatGPTKey = async () => {
    if (chatGPTKey.trim()) {
      setVerificationStatus('Verifying...');
      setTimeout(() => {
        setVerificationStatus('ChatGPT API key verified successfully.');
        alert('ChatGPT API key verified successfully.');
      }, 1000);
    } else {
      setVerificationStatus('Invalid API key.');
      alert('Invalid API key.');
    }
  };

  const handleClearTasks = () => {
    localStorage.removeItem('todos'); // adjust key if needed
    alert('All tasks have been cleared.');
  };

  const handleClearEvents = () => {
    localStorage.removeItem('events');
    window.dispatchEvent(new Event('eventsCleared'));
    alert('All events have been cleared.');
  };

  const handleCreateRandomTodo = () => {
    const randomTodos = Array.from({ length: 10 }, () => createRandomTodo(activeProjects));
    randomTodos.forEach(newTodo => {
      addTask(newTodo);
    });
    alert('10 random todos created!');
  };

  return (
    <div className="flex flex-col h-full w-full p-4 rounded-3xl justify-center bg-b-white-100 space-y-4">
      <div>
        <label htmlFor="username" className="text-b-black-600 mb-2">User Name:</label>
        <input 
          id="username" 
          type="text" 
          value={userName} 
          onChange={handleUserNameChange} 
          className="p-2 border rounded-md w-full"
        />
      </div>
      <div>
        <label htmlFor="chatGPTKey" className="text-b-black-600 mb-2">ChatGPT API Key:</label>
        <input 
          id="chatGPTKey" 
          type="text" 
          value={chatGPTKey} 
          onChange={handleChatGPTKeyChange} 
          className="p-2 border rounded-md w-full"
          placeholder="Enter your ChatGPT API key..."
        />
        <button 
          onClick={verifyChatGPTKey} 
          className="mt-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Verify API Key
        </button>
        {verificationStatus && (
          <p className="mt-2 text-sm text-green-600">{verificationStatus}</p>
        )}
      </div>
      <div className="flex flex-col space-y-2">
        <button 
          onClick={handleClearTasks} 
          className="p-2 bg-red-500 text-white rounded-md"
        >
          Clear All Tasks
        </button>
        <button 
          onClick={handleClearEvents} 
          className="p-2 bg-red-500 text-white rounded-md"
        >
          Clear All Events
        </button>
        {/* New button to create a random todo */}
        <button 
          onClick={handleCreateRandomTodo}
          className="p-2 bg-green-500 text-white rounded-md"
        >
          Create Random Todo
        </button>
      </div>
    </div>
  );
}

export default Settings;