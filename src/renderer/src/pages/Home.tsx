import React, { useState, useEffect } from 'react';
import Chat from "../components/Chat";
import MiniCalendar from "../components/MiniCalendar"; // Import the MiniCalendar component
import CompactTodoItem from '../components/CompactTodoItem'; // Import the CompactTodoItem component

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
      color: event.color || '#000000', // Ensure color property exists
    }));
  }
  return [];
};

function Home() {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [todos, setTodos] = useState(loadTodosFromLocalStorage());
  const [events, setEvents] = useState(loadEventsFromLocalStorage());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getActiveTasks = () => {
    return todos.filter(todo => !todo.completed).length;
  };

  const getTasksDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to start of the next day
  
    return todos.filter(todo => {
      if (!todo.dueDate) return false; // Check if dueDate exists
      const dueDate = new Date(todo.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  };

  const getEventsToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to start of the next day

    return events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= today && eventStart < tomorrow;
    });
  };

  const tasksDueToday = getTasksDueToday();
  const eventsToday = getEventsToday();
  const activeTasks = getActiveTasks();

  return (
    <div className="flex flex-col h-full w-full p-8 rounded-3xl justify-between bg-b-white-100">
      
      <div className="flex flex-row h-2/6 w-full justify-between">
        {/* Welcome Card */}
        <div className="flex flex-col justify-start w-1/4 h-full rounded-lg mx-4">
          <div className="rounded-lg align-top">
            <p className="text-b-black-100 text-2xl">Good {timeOfDay}, <span className='text-b-blue-300'>Makai</span></p>
            <p className="text-b-black-100">You have {activeTasks} active tasks.</p>
            <p className="text-red-500">You have {tasksDueToday.length} tasks due today.</p>
          </div>
        </div>
        {/* Agenda Card */}
        <div className="flex flex-col w-3/4 rounded-lg mx-4 p-4 overflow-y-auto">
          <p className='pb-2 text-md text-b-black-500'>Today's Agenda</p>
          <div className="rounded-lg m-auto w-full">
  {tasksDueToday.length > 0 ? (
    tasksDueToday.map((todo, index) => (
      <CompactTodoItem
        key={index}
        todo={todo}
        onToggle={() => {}}
        onUpdate={() => {}}
        onSave={() => {}}
        selectedIcon={todo.icon} // Pass the selectedIcon prop
      />
    ))
  ) : (
    <p className="text-black text-center">No tasks due today.</p>
  )}
  {eventsToday.length > 0 ? (
    eventsToday.map((event, index) => (
      <div key={index} className="p-2 my-2 rounded-lg shadow" style={{ backgroundColor: event.color }}>
        <p className="text-b-white-300 font-bold">{event.title}</p>
        <p className="text-b-white-300">{new Date(event.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-b-white-300">{event.description}</p>
      </div>
    ))
  ) : (
    <p className="text-black text-center">No events today.</p>
  )}
</div>
        </div>
      </div>
      {/* Middle Cards */}
      <div className="flex flex-row h-4/6 w-full pt-4 justify-between">
        <div className="flex bg-b-white-100 w-3/5 h-full rounded-lg m-auto pr-10">
          <div className="w-full h-full place-content-end">
            <Chat />
          </div>
        </div>
        <div className="flex flex-col bg-b-white-100 w-2/5 h-full rounded-lg m-auto">
          <MiniCalendar />
        </div>
      </div>
    </div>
  );
}

export default Home;