import React, { useState } from 'react';

function Settings() {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Makai');
  const [chatGPTKey, setChatGPTKey] = useState(localStorage.getItem('chatGPTKey') || '');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    localStorage.setItem('userName', e.target.value);
  };

  const handleChatGPTKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatGPTKey(e.target.value);
    localStorage.setItem('chatGPTKey', e.target.value);
  };

  const verifyChatGPTKey = async () => {
    // Your actual verification code would go here.
    // For now, we simulate a successful verification if the key is non-empty.
    if (chatGPTKey.trim()) {
      // Simulate a delay for verifying the API key
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
    </div>
  );
}

export default Settings;