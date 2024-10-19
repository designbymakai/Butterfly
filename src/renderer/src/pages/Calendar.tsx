import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import EventModal from '../components/EventModal';
import ViewEventModal from '../components/ViewEventModal';
import '../assets/Calendar.css'; // Ensure this imports your custom CSS

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

const Cal = (props) => {
  const [events, setEvents] = useState(loadEventsFromLocalStorage());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);

  useEffect(() => {
    console.log("Events:", events);
    saveEventsToLocalStorage(events);
  }, [events]);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setEditingEvent(null);
    setModalIsOpen(true);
  };

  const handleSelectEvent = (event) => {
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
          draggableAccessor={(event) => true}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
            },
          })}
        />
      </div>
      <EventModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        onSave={handleSaveEvent}
        event={editingEvent || { start: selectedSlot?.start, end: selectedSlot?.end }}
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