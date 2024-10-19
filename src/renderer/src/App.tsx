import React, { useEffect, useState } from 'react';
import './assets/main.css';

import Home from './pages/Home';
import Todo from './pages/Todo';
import Cal from './pages/Calendar';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrrorBoundry';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboard, faCalendar, faCog } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [activeComponent, setActiveComponent] = useState('Home');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Home':
        return <Home />;
      case 'Todo':
        return <Todo />;
      case 'Cal':
        return <Cal />;
      case 'Settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full overflow-hidden bg-b-black-200 p-4 pl-0">
        {/* Navigation */}
        <div className="flex flex-col justify-between h-screen bg-b-black-200 text-white lg:w-1/12 w-1/6">
          <div className="flex flex-col space-y-4 p-4">
            <button
              className={`h-1/12 w-full group py-4 px-6 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                activeComponent === 'Home' ? 'bg-b-white-100 text-b-green-300' : ''
              }`}
              onClick={() => setActiveComponent('Home')}
              style={{ maxHeight: '80px' }}
            >
              <FontAwesomeIcon icon={faHome} className="text-3xl transition duration-500" />
              <span className="hover:block hidden group-hover:block transition duration-500">Home</span>
            </button>
            <button
              className={`group py-4 px-6 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                activeComponent === 'Todo' ? 'bg-b-white-100 text-b-green-300' : ''
              }`}
              onClick={() => setActiveComponent('Todo')}
              style={{ maxHeight: '80px' }}
            >
              <FontAwesomeIcon icon={faClipboard} className="text-3xl transition duration-500" />
              <span className="hover:block hidden group-hover:block transition duration-500">To-do</span>
            </button>
            <button
              className={`group py-4 px-6 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                activeComponent === 'Cal' ? 'bg-b-white-100 text-b-green-300' : ''
              }`}
              onClick={() => setActiveComponent('Cal')}
              style={{ maxHeight: '80px' }}
            >
              <FontAwesomeIcon icon={faCalendar} className="text-3xl transition duration-500" />
              <span className="hover:block hidden group-hover:block transition duration-500">Calendar</span>
            </button>
          </div>
          <div className="p-4">
            <button
              className={`group py-4 px-6 rounded hover:bg-b-white-100 hover:text-b-green-300 ${
                activeComponent === 'Settings' ? 'bg-b-white-100 text-b-green-300' : ''
              }`}
              onClick={() => setActiveComponent('Settings')}
              style={{ maxHeight: '80px' }}
            >
              <FontAwesomeIcon icon={faCog} className="text-3xl transition duration-500" />
              
            </button>
          </div>
        </div>
        {/* Navigation end */}
        <div className="flex-auto">
          <div className="flex justify-center items-center h-full space-y-4">{renderComponent()}</div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;