import React, { useState, useRef } from 'react';
import Chat from "../components/Chat";
import MiniCalendar from "../components/MiniCalendar";
import CompactTodoItem from '../components/CompactTodoItem';
import SmartSuggestionCard from '../components/SmartSuggestionCard';
import DashboardCard from '../components/DashboardCard';
import { useTasks } from '../context/TaskContext';
import moment from 'moment';



interface HomeProps {
  onNavigate: (destination: string) => void;
}

const getTimeOfDay = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return 'morning';
  } else if (currentHour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

const loadTodosFromLocalStorage = () => {
  const todos = localStorage.getItem('todos');
  if (todos) {
    const parsedTodos = JSON.parse(todos);
    return parsedTodos.map(todo => ({
      ...todo,
      dueDate: todo.dueDate && !isNaN(new Date(todo.dueDate).getTime()) ? todo.dueDate : new Date().toISOString()
    }));
  }
  return [];
};

const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  if (events) {
    return JSON.parse(events).map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      color: event.color || '#000000',
    }));
  }
  return [];
};

function Home({ onNavigate, onJumpToProject }: HomeProps & { onJumpToProject: (projectName: string) => void }) {
  const [timeOfDay] = useState(getTimeOfDay());
  const { tasks } = useTasks();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [todos] = useState(loadTodosFromLocalStorage());
  const [events] = useState(loadEventsFromLocalStorage());
  
  const storedName = localStorage.getItem('userName') || 'Makai';

  const getActiveTasks = () => {
    return todos.filter(todo => !todo.completed).length;
  };

  // Use selectedDay instead of today for agenda filtering:
  const getTasksForSelectedDay = () => {
    return tasks.filter(todo => {
      const dueStr = todo.dueDate || todo.date;
      if (!dueStr) return false;
      const dueDate = new Date(dueStr);
      return moment(dueDate).format('YYYY-MM-DD') === moment(selectedDay).format('YYYY-MM-DD');
    });
  };

  // Chat ref to call functions from the chat component
  const chatRef = useRef<any>(null);

   // Handler to send suggestion to chat
  const handleSuggestionToChat = (suggestion: string) => {
    if (chatRef.current && chatRef.current.handleSmartSuggestionClick) {
      chatRef.current.handleSmartSuggestionClick(suggestion);
    }
  };

  const getEventsForSelectedDay = () => {
    const dayStart = new Date(selectedDay);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= dayStart && eventStart < dayEnd;
    });
  };

  const tasksForSelectedDay = getTasksForSelectedDay();
  const eventsForSelectedDay = getEventsForSelectedDay();
  const activeTasks = todos.filter(todo => !todo.completed).length;

  return (
    <div className="flex flex-col h-full w-full p-8 justify-between">
      <div className="flex flex-row h-2/6 w-full justify-between">
        {/* Smart Suggestion Card goes here, removed for now */}
        
        {/* Dashboard Card */}
        <div className="flex flex-col w-1/2 h-full mx-4">
          <DashboardCard 
            todos={todos}
            tasks={tasks}
            onFocusSession={() => { alert("Focus Session triggered!"); }}
            onJumpToProject={(projectName) => {
              onNavigate('Projects');
              onJumpToProject(projectName);
            }}
          />
        </div>
        {/* Agenda Card */}
        <div className="w-2/4 flex flex-col ml-4">
          {tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map((todo, index) => (
              <CompactTodoItem
                key={index}
                title={todo.title}
                description={todo.description}
                project={todo.project}
                dueDate={todo.dueDate}
                tags={todo.tags}
                completed={todo.completed}
                onToggle={() => {}}
                onSave={() => {}}
                selectedIcon={todo.icon}
                projectColor={todo.projectColor}
                onNavigate={(destination) => onNavigate(destination)}
              />
            ))
          ) : (
            <p className="text-b-white-500 text-center">No tasks for this day.</p>
          )}
          {eventsForSelectedDay.length > 0 ? (
            eventsForSelectedDay.map((event, index) => (
              <div key={index} className="p-2 my-2 rounded shadow bg-b-black-300 hover:bg-b-black-400">
                <div className="flex flex-row justify-between">
                  <p className="text-b-white-300 font-bold" style={{ color: event.color }}>
                    {event.title}
                  </p>
                  <p className="text-b-white-600 ">
                    {new Date(event.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-b-white-100">{event.description}</p>
              </div>
            ))
          ) : (
            <p className="text-b-white-500 text-center">No events for this day.</p>
          )}
        </div>
      </div>
      
      {/* Middle Cards */}
      <div className="flex flex-row h-4/6 w-full pt-4 justify-between">
        <div className="flex w-3/5 h-full pr-10 rounded-lg m-auto">
          <div className="w-full h-full place-content-end">
            <Chat ref={chatRef}/>
          </div>
        </div>
        <div className="flex flex-col w-2/5 h-full rounded-lg m-auto">
          <MiniCalendar onSelectDate={(date) => setSelectedDay(date)} />
        </div>
      </div>
    </div>
  );
}

export default Home;