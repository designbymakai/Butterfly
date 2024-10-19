import React, { useState, useEffect } from 'react';
import EventModal from '../components/EventModal';
import moment from 'moment';

const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

const saveEventsToLocalStorage = (events) => {
  localStorage.setItem('events', JSON.stringify(events));
};

const EventsTab = () => {
  const [events, setEvents] = useState(loadEventsFromLocalStorage());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    saveEventsToLocalStorage(events);
  }, [events]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setModalIsOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setModalIsOpen(true);
  };

  const handleSaveEvent = (title, start, end, color, description) => {
    if (editingEvent) {
      setEvents(events.map(ev => (ev === editingEvent ? { ...ev, title, start, end, color, description } : ev)));
    } else {
      setEvents([...events, { start, end, title, color, description }]);
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      setEvents(events.filter(ev => ev !== editingEvent));
      setEditingEvent(null);
    }
  };

  // Sort events by start date
  const sortedEvents = events.sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className='overflow-y-auto h-full pr-2'>
      <button onClick={handleAddEvent} className='mb-4 p-2 bg-blue-500 text-white rounded'>Add Event</button>
      <div className='flex flex-col'>
        {sortedEvents.map((event, index) => (
          <div
            key={index}
            className='p-2 my-1 border rounded bg-gray-100 flex justify-between items-center'
          >
            <div>
              <h2 className='text-xl'>{event.title}</h2>
              <p>{moment(event.start).format('DD/MM/YYYY HH:mm')} - {moment(event.end).format('DD/MM/YYYY HH:mm')}</p>
              <p style={{ color: event.color }}>Color: {event.color}</p>
              <p className='w-11/12'>{event.description}</p>
            </div>
            <div className='flex'>
              <button onClick={() => handleEditEvent(event)} className='mr-2 p-2 bg-yellow-500 text-white rounded'>Edit</button>
              <button onClick={() => { setEditingEvent(event); handleDeleteEvent(); }} className='p-2 bg-red-500 text-white rounded'>Delete</button>
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default EventsTab;