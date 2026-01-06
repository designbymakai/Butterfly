import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTasks } from '../context/TaskContext';
import { getProjectColorForName } from '../utils/projectColors';
import { loadProjectsFromLocalStorage } from '../utils/localStorageUtils';
import { formatTaskDate } from '../utils/formatDate';
import { useSettings } from '../context/SettingsContext';

const localizer = momentLocalizer(moment);

const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events
    ? JSON.parse(events).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    : [];
};

interface MiniCalendarProps {
  onSelectDate?: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ onSelectDate }) => {
  // Existing code...
  const [persistedEvents, setPersistedEvents] = useState(loadEventsFromLocalStorage());
  const projects = loadProjectsFromLocalStorage();
  const { tasks } = useTasks();
  const { dateFormat } = useSettings();

  useEffect(() => {
    const updateEvents = () => {
      setPersistedEvents(loadEventsFromLocalStorage());
    };
    updateEvents();
    window.addEventListener('eventsCleared', updateEvents);
    return () => {
      window.removeEventListener('eventsCleared', updateEvents);
    };
  }, []);

  // Format tasks as events...
  const formattedTasks = tasks.map((task) => {
    const dueStr = task.dueDate || task.date;
    const tempDate = dueStr && !isNaN(Date.parse(dueStr)) ? new Date(dueStr) : new Date();
    const startDate = new Date(tempDate.setHours(0, 0, 0, 0));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    return {
      id: task.id,
      title: task.title,
      start: startDate,
      end: endDate,
      projectColor:
        task.project && task.project !== 'Unassigned'
          ? getProjectColorForName(task.project, projects)
          : '#FAF9F9',
      description: task.description,
      isTask: true,
      allDay: true,
      project: task.project,
      tags: task.tags,
    };
  });

  const mergedEvents = [...persistedEvents, ...formattedTasks];

  const eventPropGetter = (event) => {
    if (event.isTask) {
      return {
        style: {
          backgroundColor: 'transparent',
          border: 'none',
          padding: '2px 4px',
        },
        className: 'rbc-task-event',
      };
    }
    return { style: { backgroundColor: event.color || '#3182ce' } };
  };

  // Render event function remains unchanged
  const renderEvent = ({ event }) => {
    // ... existing Tippy wrapping code ...
    if (event.isTask) {
      return (
        <Tippy
          content={
            <div className="tooltip-content">
              <strong>{event.title}</strong>
              <br />
              <div className="flex justify-evenly items-center">
                <span className="text-[.7rem] text-b-blue-400">
                  <i className="pr-1 fas fa-project-diagram"></i> {event.project}
                </span>
                <span className="text-[.7rem] text-b-blue-400">
                  <i className="pr-1 fas fa-calendar"></i> {formatTaskDate(event.start, dateFormat)}
                </span>
              </div>
              <span>{event.description}</span>
            </div>
          }
          arrow={true}
          delay={[500, 0]}
        >
          <div className="rbc-task-event-content" style={{ display: 'flex', alignItems: 'center' }}>
            <span
              className="rbc-task-dot"
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: event.projectColor || 'white',
                marginRight: '4px',
              }}
            ></span>
            <span className="rbc-task-title" style={{ fontSize: '0.8rem' }}>
              {event.title}
            </span>
          </div>
        </Tippy>
      );
    }
    // fallback for non-task events...
    return (
      <Tippy
        content={
          <div className="tooltip-content">
            <strong>{event.title}</strong>
            <br />
            <i>
              {moment(event.start).format('ddd HH:mm A')} till {moment(event.end).format('ddd HH:mm A')}
            </i>
            <br />
            {event.description}
          </div>
        }
        allowHTML={true}
        trigger="mouseenter focus"
        hideOnClick={false}
      >
        <div className="tooltip">{event.title}</div>
      </Tippy>
    );
  };

  return (
    <div className="mini-calendar-container" style={{ position: 'relative', zIndex: 100 }}>
      <Calendar
        localizer={localizer}
        events={mergedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, border: 'none' }}
        views={['month']}
        defaultView="month"
        toolbar={false}
        selectable
        onNavigate={() => {}}
        onSelectSlot={(slotInfo) => {
          // When a slot is selected, notify the parent.
          if (onSelectDate) onSelectDate(slotInfo.start);
        }}
        eventPropGetter={eventPropGetter}
        components={{
          event: renderEvent,
        }}
      />
    </div>
  );
};

export default MiniCalendar;