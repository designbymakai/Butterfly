import React, { useState } from 'react';
import Chat from "../components/Chat";
import MiniCalendar from "../components/MiniCalendar";
import CompactTodoItem from '../components/CompactTodoItem';
import Clock from '../components/Clock';
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

function Home({ onNavigate }: HomeProps) {
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
        {/* Welcome Card */}
        <div className="flex flex-col w-1/4 h-full rounded-lg mx-4 justify-between">
          <div className="rounded-lg align-top">
            <p className="text-b-white-100 text-2xl">
              Good {timeOfDay}, <span className='text-b-blue-300'>{storedName}</span>
            </p>
            <p className="text-b-white-400 rounded-2xl w-fit py-1 px-2 mt-2">
              You have <span className='text-b-green-300'>{activeTasks}</span> active tasks, <span className='text-b-orange-300'></span> due today.
            </p>
          </div>
        </div>
        {/* Agenda Card */}
        <div className="w-2/3 flex flex-col">
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
            <Chat />
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