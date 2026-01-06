// src/renderer/src/pages/Calendar.tsx
import { useState, useEffect } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import EventModal from '../components/EventModal';
import ViewEventModal from '../components/ViewEventModal';
import '../assets/Calendar.css'; // Ensure this imports your custom CSS
import { useTasks } from '../context/TaskContext';
import Tippy from '@tippyjs/react';
import { getProjectColor } from '../utils/projectColors';
import { getProjectColorForName } from '../utils/projectColors';
import { loadProjectsFromLocalStorage } from '../utils/localStorageUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faCalendar } from '@fortawesome/free-solid-svg-icons';



const WorkCal = withDragAndDrop(Calendar);
const projects = loadProjectsFromLocalStorage();

const localizer = momentLocalizer(moment); // or globalizeLocalizer

export const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events
    ? JSON.parse(events).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    : [];
};

export const saveEventsToLocalStorage = (events: any[]) => {
  localStorage.setItem('events', JSON.stringify(events));
};

const Cal = () => {
  const { tasks, updateTask } = useTasks();
  // Use one state for persisted events.
  const [events, setEvents] = useState(loadEventsFromLocalStorage());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);

  // Update persisted events when events are cleared externally.
  useEffect(() => {
    const handleEventsCleared = () => {
      setEvents(loadEventsFromLocalStorage());
    };
    window.addEventListener('eventsCleared', handleEventsCleared);
    return () => {
      window.removeEventListener('eventsCleared', handleEventsCleared);
    };
  }, []);

  const formattedTasks = tasks.map((task) => {
    const dueStr = task.dueDate || task.date;
    const tempDate =
      dueStr && !isNaN(Date.parse(dueStr)) ? new Date(dueStr) : new Date();
    const startDate = new Date(tempDate.setHours(0, 0, 0, 0));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // one day later

    return {
      id: task.id,
      title: task.title,
      start: startDate,
      end: endDate,
      // Use getProjectColorForName to look up the project color from your projects list:
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

  useEffect(() => {
    console.log("Tasks from context:", tasks);
  }, [tasks]);

  // Merge persisted events with formatted tasks for rendering.
  const mergedEvents = [...events, ...formattedTasks];

  useEffect(() => {
    console.log("Formatted Tasks:", formattedTasks);
  }, [tasks]);
  // Optional: log mergedEvents for debugging
  useEffect(() => {
    console.log("Merged Events:", mergedEvents);
  }, [mergedEvents]);

  // No need to update persisted events state when tasks change,
  // because tasks are display-only and merged in runtime.
  // Persisted events (from local storage) are updated via event handlers below.

  const handleSelectSlot = () => {
    setEditingEvent(null);
    setModalIsOpen(true);
  };

  const handleSelectEvent = (event) => {
    if (event.isTask) {
      // Handle task selection differently if needed
      return;
    }
    setViewingEvent(event);
    setViewModalIsOpen(true);
  };

  useEffect(() => {
    // Remove task events from local storage whenever tasks change.
    const nonTaskEvents = events.filter(ev => !ev.isTask);
    saveEventsToLocalStorage(nonTaskEvents);
    // Re-run mergedEvents by "refreshing" the local state if needed.
    setEvents(nonTaskEvents);
  }, [tasks]);

  const handleSaveEvent = (updatedEvent) => {
    if (editingEvent) {
      setEvents(events.map(ev => (ev.id === editingEvent.id ? updatedEvent : ev)));
    } else {
      setEvents([...events, updatedEvent]);
    }
    setModalIsOpen(false);
    setEditingEvent(null);
    saveEventsToLocalStorage(
      // Save only persisted events, not display-only tasks
      events.map((ev) => ev.isTask ? null : ev).filter(Boolean)
    );
  };

  const handleDeleteEvent = () => {
    if (viewingEvent) {
      const updated = events.filter(ev => ev.id !== viewingEvent.id);
      setEvents(updated);
      setViewingEvent(null);
      setViewModalIsOpen(false);
      saveEventsToLocalStorage(updated.filter((ev) => !ev.isTask));
    }
  };

  const handleEditEvent = () => {
    setEditingEvent(viewingEvent);
    setViewModalIsOpen(false);
    setModalIsOpen(true);
  };

  const handleEventDrop = ({ event, start, end }) => {
    if (event.isTask) {
      // Find the original task by ID
      const originalTask = tasks.find(t => t.id === event.id);
      if (!originalTask) return;

      const newDate = new Date(start);
      newDate.setHours(0, 0, 0, 0);

      // Merge all fields from the original task, but update the date
      const updatedTask = {
        ...originalTask,
        dueDate: newDate.toISOString(),
        start: newDate,
        end: new Date(newDate.getTime() + 86400000),
        project: event.project,
        tags: event.tags,
        projectColor: event.projectColor,
      };
      console.log("Updating task via drag-drop:", updatedTask);
      updateTask(updatedTask);
    } else {
      // For non-task events, update as usual.
      const updatedEvent = { ...event, start: new Date(start), end: new Date(end) };
      setEvents(events.map(ev => (ev.id === event.id ? updatedEvent : ev)));
      saveEventsToLocalStorage(
        events.map(ev => (ev.id === event.id ? updatedEvent : ev))
      );
    }
  };

  const handleEventResize = ({ event, start, end }) => {
    const updatedEvent = { ...event, start: new Date(start), end: new Date(end) };
    setEvents(events.map(ev => (ev.id === event.id ? updatedEvent : ev)));
    saveEventsToLocalStorage(events.map((ev) => ev.id === event.id ? updatedEvent : ev));
  };

  const eventPropGetter = (event) => {
    if (event.isTask) {
      return {
        style: {
          backgroundColor: 'rgba(255, 0, 0, 0.4)', // stronger red tint for debugging
          border: '2px solid red',
          padding: '2px 4px',
          fontSize: '0.8rem',
        },
        className: 'rbc-task-event',
      };
    }
    return { style: { backgroundColor: event.color } };
  };

  const renderEvent = ({ event }) => {
    if (event.isTask) {
      return (
        <Tippy
          content={
            <div className="tooltip-content">
              <span className='text-lg text-b-blue-100'>{event.title}</span>
              <br />
              <div className='flex justify-evenly items-center'>
              <span className='text-b-blue-400 text-[.7rem]'>
                <FontAwesomeIcon icon={faProjectDiagram} className='pr-1'/>
                {event.project}
                </span>
              <span className='text-b-blue-400 text-[.7rem]'>
                <FontAwesomeIcon icon={faCalendar} className='pr-1'/>
                {moment(event.start).format('MMM D')}
                </span>
              </div>
              <span>{event.description}</span>
            </div>
          }
          arrow={true}
          delay={[500, 0]}
        >
          <div className="rbc-task-event-content">
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
            <span className="rbc-task-title">{event.title}</span>
          </div>
        </Tippy>
      );
    }
    // For non-task events, you can keep your previous Tippy or default rendering.
    return (
      <Tippy
        content={
          <div className="tooltip-content">
            <strong>{event.title}</strong>
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
    <div className='w-full h-full rounded-3xl'>
      <div className="calendar-container">
        <WorkCal
          localizer={localizer}
          events={mergedEvents} // rendering mergedEvents
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          draggableAccessor={() => true}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventPropGetter}
          components={{
          event: renderEvent,  // Use your custom event renderer
        }}
      />
      </div>
      <EventModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialTitle={editingEvent ? editingEvent.title : ''}
        initialStart={editingEvent ? new Date(editingEvent.start) : new Date()}
        initialEnd={editingEvent ? new Date(editingEvent.end) : new Date()}
        initialColor={editingEvent ? editingEvent.color : '#000000'}
        initialDescription={editingEvent ? editingEvent.description : ''}
      />
      <ViewEventModal
        isOpen={viewModalIsOpen}
        onRequestClose={() => setViewModalIsOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        event={viewingEvent}
        onColorChange={(newColor) => {
          setViewingEvent({ ...viewingEvent, color: newColor });
          setEvents(events.map(ev => (ev.id === viewingEvent.id ? { ...ev, color: newColor } : ev)));
          saveEventsToLocalStorage(events.map((ev) => ev.id === viewingEvent.id ? { ...ev, color: newColor } : ev));
        }}
      />
    </div>
  );
};

export default Cal;