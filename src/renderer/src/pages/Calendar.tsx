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

const WorkCal = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment); // or globalizeLocalizer

export const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events).map(event => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  })) : [];
};

const saveEventsToLocalStorage = (events) => {
  localStorage.setItem('events', JSON.stringify(events));
};

const Cal = () => {
  const { tasks } = useTasks();
  const [events, setEvents] = useState(loadEventsFromLocalStorage());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);

  useEffect(() => {
    const formattedTasks = tasks.map((task) => ({
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate),
      color: task.projectColor,
      description: task.description,
      isTask: true, // Add a flag to distinguish tasks from events
    }));
    setEvents((prevEvents) => [...prevEvents, ...formattedTasks]);
  }, [tasks]);

  useEffect(() => {
    console.log("Events:", events);
    saveEventsToLocalStorage(events);
  }, [events]);

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

  const handleSaveEvent = (updatedEvent) => {
    if (editingEvent) {
      setEvents(events.map(ev => (ev === editingEvent ? updatedEvent : ev)));
    } else {
      setEvents([...events, updatedEvent]);
    }
    setModalIsOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (viewingEvent) {
      setEvents(events.filter(ev => ev !== viewingEvent));
      setViewingEvent(null);
      setViewModalIsOpen(false);
    }
  };

  const handleEditEvent = () => {
    setEditingEvent(viewingEvent);
    setViewModalIsOpen(false);
    setModalIsOpen(true);
  };

  const handleEventDrop = ({ event, start, end }) => {
    const updatedEvent = { ...event, start: new Date(start), end: new Date(end) };
    setEvents(events.map(ev => (ev === event ? updatedEvent : ev)));
  };

  const handleEventResize = ({ event, start, end }) => {
    const updatedEvent = { ...event, start: new Date(start), end: new Date(end) };
    setEvents(events.map(ev => (ev === event ? updatedEvent : ev)));
  };

  const eventPropGetter = (event) => {
    if (event.isTask) {
      return {
        className: 'rbc-task', // Apply custom class for tasks
      };
    }
    return {
      style: {
        backgroundColor: event.color,
      },
    };
  };

  return (
    <div className='w-full h-full bg-b-white-100 rounded-3xl'>
      <div className="calendar-container">
        <WorkCal
          localizer={localizer}
          events={events}
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
        onDelete={handleDeleteEvent} // Pass the onDelete prop
        event={viewingEvent}
        onColorChange={(newColor) => {
          setViewingEvent({ ...viewingEvent, color: newColor });
          setEvents(events.map(ev => (ev === viewingEvent ? { ...ev, color: newColor } : ev)));
        }}
      />
    </div>
  );
};

export default Cal;