import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional for styling
import '../assets/Calendar.css'; // Ensure this imports your custom CSS

const localizer = momentLocalizer(moment);

const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

const MiniCalendar = () => {
  const [events, setEvents] = useState(loadEventsFromLocalStorage());

  useEffect(() => {
    setEvents(loadEventsFromLocalStorage());
  }, []);

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.color,
    },
  });

  const renderEvent = ({ event }) => (
    <Tippy
      render={(attrs) => (
        <div className="tooltip-content" {...attrs}>
          <strong>{event.title}</strong>
          <i>{moment(event.start).format('ddd HH:mm A')} till {moment(event.end).format('ddd HH:mm A')}</i><br/>
          {event.description}
        </div>
      )}
      allowHTML={true}
    >
      <div className="tooltip">{event.title}</div>
    </Tippy>
  );

  return (
    <div className="mini-calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, border: 'none' }}
        views={['month']}
        defaultView="month"
        toolbar={false}
        selectable={false}
        popup={true}
        eventPropGetter={eventPropGetter}
        components={{
          event: renderEvent,
        }}
      />
    </div>
  );
};

export default MiniCalendar;