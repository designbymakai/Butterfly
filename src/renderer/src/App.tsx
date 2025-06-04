import './assets/main.css';

import Home from './pages/Home';
import Todo from './pages/Todo';
import Projects from './pages/Projects'; // Import the new Projects page
import Cal from './pages/Calendar';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrrorBoundry';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboard, faProjectDiagram, faCalendar, faCog } from '@fortawesome/free-solid-svg-icons'; // Import faProjectDiagram icon
import { TaskProvider } from './context/TaskContext';

function App() {
  const [activeComponent, setActiveComponent] = useState('Home');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Home':
        return <Home />;
      case 'Todo':
        return <Todo />;
      case 'Projects': // Add case for Projects
        return <Projects />;
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
      <TaskProvider>
        <div className="flex h-screen w-full overflow-hidden bg-b-black-200 p-4 pl-0">
          {/* Navigation */}
          <div className="flex flex-col justify-between h-screen bg-b-black-200 text-white w-fit">
            <div className="flex flex-col space-y-4 p-4">
              <button
                className={`h-1/12 w-full group py-4 px-4 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                  activeComponent === 'Home' ? 'bg-b-white-100 text-b-green-300' : ''
                }`}
                onClick={() => setActiveComponent('Home')}
                style={{ maxHeight: '80px' }}
              >
                <FontAwesomeIcon icon={faHome} className="text-2xl transition duration-500" />
              </button>
              <button
                className={`group py-4 px-4 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                  activeComponent === 'Todo' ? 'bg-b-white-100 text-b-green-300' : ''
                }`}
                onClick={() => setActiveComponent('Todo')}
                style={{ maxHeight: '80px' }}
              >
                <FontAwesomeIcon icon={faClipboard} className="text-2xl transition duration-500" />
              </button>
              <button
                className={`group py-4 px-4 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                  activeComponent === 'Projects' ? 'bg-b-white-100 text-b-green-300' : ''
                }`}
                onClick={() => setActiveComponent('Projects')}
                style={{ maxHeight: '80px' }}
              >
                <FontAwesomeIcon icon={faProjectDiagram} className="text-2xl transition duration-500" />
              </button>
              <button
                className={`group py-4 px-4 rounded hover:bg-b-white-100 hover:text-b-green-300 transition hover:scale-110 ${
                  activeComponent === 'Cal' ? 'bg-b-white-100 text-b-green-300' : ''
                }`}
                onClick={() => setActiveComponent('Cal')}
                style={{ maxHeight: '80px' }}
              >
                <FontAwesomeIcon icon={faCalendar} className="text-2xl transition duration-500" />
              </button>
            </div>
            <div className="p-4 pb-8">
              <button
                className={`group py-4 px-4 rounded hover:bg-b-white-100 hover:text-b-green-300 ${
                  activeComponent === 'Settings' ? 'bg-b-white-100 text-b-green-300' : ''
                }`}
                onClick={() => setActiveComponent('Settings')}
                style={{ maxHeight: '80px' }}
              >
                <FontAwesomeIcon icon={faCog} className="text-2xl transition duration-500" />
              </button>
            </div>
          </div>
          {/* Navigation end */}
          <div className="flex-auto">
            <div className="flex justify-center items-center h-full space-y-4">{renderComponent()}</div>
          </div>
        </div>
      </TaskProvider>
    </ErrorBoundary>
  );
}

export default App;