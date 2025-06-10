import { v4 as uuidv4 } from 'uuid'
import { loadTodosFromLocalStorage, saveTodosToLocalStorage } from './localStorageUtils'
import { loadEventsFromLocalStorage, saveEventsToLocalStorage } from './localStorageUtils'

export const createTask = (taskDetails: any) => {
  const tasks = loadTodosFromLocalStorage()
  const newTask = {
    id: taskDetails.id,
    title: taskDetails.title,
    description: taskDetails.description || '',
    dueDate: taskDetails.dueDate,
    project: taskDetails.project,
    tags: taskDetails.tags,
    completed: false,
    icon: 'default-icon' // Optionally define a default
  }
  const updatedTasks = [...tasks, newTask]
  saveTodosToLocalStorage(updatedTasks)
  console.log('Task created:', newTask)
}

export const updateTask = (taskUpdates: any) => {
  const tasks = loadTodosFromLocalStorage()
  const updatedTasks = tasks.map((task) =>
    task.id === taskUpdates.id ? { ...task, ...taskUpdates } : task
  )
  saveTodosToLocalStorage(updatedTasks)
  console.log('Task updated:', taskUpdates)
}

export const getTaskDetails = (taskId: string) => {
  const tasks = loadTodosFromLocalStorage()
  const task = tasks.find((task) => task.id === taskId)
  console.log('Retrieved task details:', task)
  return task
}

export const createEvent = (eventDetails: any) => {
  const events = loadEventsFromLocalStorage()
  const newEvent = {
    id: uuidv4(),
    title: eventDetails.title,
    description: eventDetails.description || '',
    start: eventDetails.start,
    end: eventDetails.end
  }
  const updatedEvents = [...events, newEvent]
  saveEventsToLocalStorage(updatedEvents)
  console.log('Event created:', newEvent)
}

export const updateEvent = (eventUpdates: any) => {
  const events = loadEventsFromLocalStorage()
  const updatedEvents = events.map((event) =>
    event.id === eventUpdates.id ? { ...event, ...eventUpdates } : event
  )
  saveEventsToLocalStorage(updatedEvents)
  console.log('Event updated:', eventUpdates)
}

export const getEventDetails = (eventId: string) => {
  const events = loadEventsFromLocalStorage()
  const event = events.find((event) => event.id === eventId)
  console.log('Retrieved event details:', event)
  return event
}
