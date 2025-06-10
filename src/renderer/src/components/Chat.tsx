import React, { useState, useEffect, useRef } from 'react'
import { loadTodosFromLocalStorage, saveTodosToLocalStorage } from '../utils/localStorageUtils'
import { loadEventsFromLocalStorage, saveEventsToLocalStorage } from '@renderer/pages/Calendar';
import ReactMarkdown from 'react-markdown'
import CompactTodoItem from './CompactTodoItem'
import { v4 as uuidv4 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBroom, faClipboardList, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'
import { parseTaskCommand } from '@renderer/utils/parseTaskCommand'
import { parseEventCommand } from '@renderer/utils/parseEventCommand'
import SelectorModal from './modals/selectorModal'
import { useTasks } from '../context/TaskContext';


interface Message {
  sender: 'user' | 'bot'
  content: string | (string | JSX.Element)[]
  tasks?: Task[]
}

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  project: string
  tags: string[]
  icon: any
}

interface Event {
  title: string
  description: string
  start: string
  end: string
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const { addTask } = useTasks();
  const [input, setInput] = useState('')
  const createTaskRef = useRef<(taskDetails: Task) => void>()
  const [action, setAction] = useState<'new' | 'edit' | 'remove' | null>(null)
  const [target, setTarget] = useState<'task' | 'event' | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerItems, setPickerItems] = useState<any[]>([]) // tasks or events
  const [pickerTitle, setPickerTitle] = useState('')

  const brandStylePrompt = `
    You are Butterfly, a supportive productivity assistant. Whenever a user gives a plain text command to create a task (for example, "Create a task: turn in library book on tuesday" or "I need to return my rental car on friday"), convert that command into a function call to "createTask" with a JSON object containing the required fields: title, dueDate, project (if any), and tags (if any)
    `

  // Single instance of createTask throughout the file.
  const createTask = (taskDetails: Task): Task => {
    const tasks = loadTodosFromLocalStorage();
    const updatedTaskDetails = {
      ...taskDetails,
      id: taskDetails.id === 'placeholder-id' || !taskDetails.id ? uuidv4() : taskDetails.id,
      completed: false,
      icon: taskDetails.icon || null
    };
    const updatedTasks = [...tasks, updatedTaskDetails];
    saveTodosToLocalStorage(updatedTasks);
    console.log('Task saved to local storage:', updatedTaskDetails);
    return updatedTaskDetails;
  }

  const createEvent = (eventDetails: Event & { id?: string }): Event & { id: string } => {
  // Load existing events from local storage.
    const events = loadEventsFromLocalStorage() || [];
    const newEvent = {
      ...eventDetails,
      id: eventDetails.id || uuidv4() // assign a new id if not provided
    };
    const updatedEvents = [...events, newEvent];
    saveEventsToLocalStorage(updatedEvents);
    console.log('Event saved to local storage:', newEvent);
    return newEvent;
  };

// Example helper to convert a plain text event command to a createEvent call.
  function createEventFromPlainTextCommand(command) {
    // Regular expression to extract:
    // - title (everything after "New Event:" up to the day)
    // - day (e.g. Tuesday)
    // - time (e.g. 9AM)
    const regex = /(?:new event:\s*)(?<title>.+?)\s+(?<day>\w+)\s+at\s+(?<time>[\d:APMapm]+)/i;
    const match = command.match(regex);
    if (!match || !match.groups) {
      console.error("Invalid event command format");
      return;
    }
    
    const title = match.groups.title.trim();
    const dayStr = match.groups.day.trim();
    const timeStr = match.groups.time.trim();
    
    // Compute the next occurrence of the given day with the specified time.
    const now = new Date();
    const daysOfWeek = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    
    let targetDayIndex = daysOfWeek[dayStr.toLowerCase()];
    if (targetDayIndex === undefined) {
      console.error("Invalid day provided:", dayStr);
      return;
    }
    
    // Calculate how many days in the future the target day is.
    let diff = ((targetDayIndex + 7 - now.getDay()) % 7) || 7;
    const eventDate = new Date(now);
    eventDate.setDate(now.getDate() + diff);
    
    // Parse the time string (e.g., "9AM" or "9:30 PM")
    const timeParts = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      let minutes = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
      const period = timeParts[3] ? timeParts[3].toUpperCase() : null;
      
      if (period === 'PM' && hours < 12) {
        hours += 12;
      }
      if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      eventDate.setHours(hours, minutes, 0, 0);
    }
    
    // Set a default duration of one hour (adjust as needed)
    const endDate = new Date(eventDate);
    endDate.setHours(eventDate.getHours() + 1);
    
    const eventDetails = {
      title,
      description: "",
      start: eventDate.toISOString(),
      end: endDate.toISOString()
    };
    
    // Call your local createEvent function
    createEvent(eventDetails);
  }

  const handleSend = async (messageContent?: string) => {
    const content = messageContent || input
    if (!content.trim()) return
    const parsedEvent = parseEventCommand(content);
    if (parsedEvent) {
      // Create the event locally and capture the created event.
      const newEvent = createEvent(parsedEvent);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', content },
        {
          sender: 'bot',
          content: [
            <div className="p-2" key="event-created">
              <strong>New Event Created:</strong> {newEvent.title} from {new Date(newEvent.start).toLocaleString()} to {new Date(newEvent.end).toLocaleString()}
            </div>
          ]
        }
      ]);
      setInput('');
      return;
    }
    // Use parseTaskCommand to check if the command is a plain text task command.
    const parsedTask = parseTaskCommand(content)
    if (parsedTask) {
      const newTask = createTask(parsedTask);
      // Update task context as well:
      addTask(newTask);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', content },
        {
          sender: 'bot',
          content: [
            <CompactTodoItem
              key={newTask.id}
              title={newTask.title}
              description={newTask.description}
              dueDate={newTask.dueDate}
              completed={newTask.completed}
              project={newTask.project}
              tags={newTask.tags}
              onToggle={() => {}}
              onSave={() => {}}
              selectedIcon={newTask.icon}
              projectColor={newTask.projectColor}
              onNavigate={() => {}}
            />
          ]
        }
      ])
      setInput('')
      return
    }

    // Otherwise, continue with your API logic for other commands.
    const chatGPTKey = localStorage.getItem('chatGPTKey') || ''
    const userMessage: Message = { sender: 'user', content }
    setMessages((prev) => [...prev, userMessage])

    const finalPrompt = `${brandStylePrompt}`
    console.log('Final Prompt:', finalPrompt)

    try {
      const response = await (window.api as any).fetchOpenAIResponse(finalPrompt, chatGPTKey)
      console.log('ChatGPT Response:', response)

      let botMessage: Message

      try {
        const jsonResponse = JSON.parse(response)
        if (jsonResponse.tasks) {
          botMessage = {
            sender: 'bot',
            content: jsonResponse.tasks.map((task: Task) => (
              <CompactTodoItem
                key={task.id}
                title={task.title}
                description={task.description}
                dueDate={task.dueDate}
                completed={task.completed}
                project={task.project}
                tags={task.tags}
                onToggle={() => {}}
                onUpdate={() => {}}
                onSave={() => {}}
                selectedIcon={task.icon}
                projectColor={''}
                onNavigate={() => {}}
              />
            ))
          }
        } else if (jsonResponse.task) {
          botMessage = {
            sender: 'bot',
            content: [
              <div key="task-details">
                <strong>Task Details:</strong> {JSON.stringify(jsonResponse.task)}
              </div>
            ]
          }
        } else if (jsonResponse.eventDetails) {
          botMessage = {
            sender: 'bot',
            content: [
              <div key="event-details">
                <strong>Event Details:</strong> {JSON.stringify(jsonResponse.eventDetails)}
              </div>
            ]
          }
        } else if (jsonResponse.message) {
          botMessage = {
            sender: 'bot',
            content: [<span key="message">{jsonResponse.message}</span>]
          }
        } else {
          botMessage = {
            sender: 'bot',
            content: [<span key="fallback">Structured response received, but unknown format.</span>]
          }
        }
      } catch (parseError) {
        botMessage = { sender: 'bot', content: [response] }
      }

      setMessages((prevMessages) => [...prevMessages, botMessage])
    } catch (error) {
      if (error && error.message && error.message.includes('Unexpected token')) {
        alert(
          'Received an HTML error page from the server—your backend may be down or misconfigured.'
        )
      }
      console.error('Error fetching response from ChatGPT:', error)
    }

    setInput('')
  }

  const handleModifierClick = (mod: 'new' | 'edit' | 'remove') => {
    setAction(mod)
    // Clear any existing target selection
    setTarget(null)
    // Pre-fill input with the modifier (capitalized) so the user sees an active state.
    setInput(mod.charAt(0).toUpperCase() + mod.slice(1) + ' ')
  }

  const parseTaskDetails = (jsonString: string) => {
    try {
      console.log('Parsing JSON string:', jsonString)
      const jsonObjects = jsonString.match(/{[^}]+}/g)
      if (!jsonObjects) {
        throw new Error('No valid JSON objects found')
      }
      return jsonObjects
        .map((jsonObject) => {
          console.log('Parsing JSON object:', jsonObject)
          const taskDetails = JSON.parse(jsonObject)
          if (taskDetails.id === 'placeholder-id') {
            taskDetails.id = uuidv4()
          }
          if (!taskDetails.dueDate || !taskDetails.title) {
            console.warn('Skipping invalid task details:', taskDetails)
            return null
          }
          return {
            ...taskDetails,
            dueDate:
              taskDetails.dueDate && !isNaN(new Date(taskDetails.dueDate).getTime())
                ? taskDetails.dueDate
                : new Date().toISOString(),
            project: taskDetails.project || 'No Project'
          }
        })
        .filter((task) => task !== null)
    } catch (error) {
      console.error('Error parsing JSON string:', error)
      return []
    }
  }

  // Handler for target selection buttons.
  const handleTargetClick = (targetType: 'task' | 'event') => {
    setTarget(targetType)
    if (action === 'edit' || action === 'remove') {
      // Open the selection modal
      if (targetType === 'task') {
        const tasks = loadTodosFromLocalStorage()
        setPickerItems(tasks)
        setPickerTitle(
          `Select a ${targetType.charAt(0).toUpperCase() + targetType.slice(1)} to ${action}`
        )
      }
      // You would do similar for events.
      setShowPicker(true)
    } else {
      // For a 'new' modifier, update the input with a complete prefix.
      setInput(
        `${action?.charAt(0).toUpperCase() + action?.slice(1)} ${targetType === 'task' ? 'Task:' : 'Event:'}`
      )
    }
  }

  // Handler when an item is selected from the picker.
  const handlePickerSelect = (item: Task | any) => {
    setShowPicker(false)
    // For edit or remove, you can then either open another modal for editing
    // or immediately remove and update state.
    if (action === 'remove') {
      // Remove item from local storage (you’d implement removeTask or removeEvent)
      const tasks = loadTodosFromLocalStorage().filter((t: Task) => t.id !== item.id)
      saveTodosToLocalStorage(tasks)
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', content: `Task "${item.title}" removed successfully.` }
      ])
    } else if (action === 'edit') {
      // Pre-fill fields for editing; here we simply log the selected item.
      setInput(`Edit Task: ${item.title}`)
      // Later your UI can trigger an edit flow.
    }
    // Reset the modifiers.
    setAction(null)
    setTarget(null)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex flex-col justify-center m-auto p-5 overflow-hidden h-full">
      {/* Message List */}
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 my-1 rounded ${message.sender === 'bot' ? 'bg-blue-300' : 'bg-white'}`}
            >
              {message.sender === 'bot' ? message.content : message.content}
            </div>
          ))}
        </div>
      </div>

      {/* Modifier Buttons */}
      <div className="flex items-center space-x-4">
        {/* Modifier Buttons */}
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-lg ${action === 'new' ? 'bg-b-blue-500' : 'bg-b-black-300'} text-b-white-100 transition-all duration-300`}
            onClick={() => handleModifierClick('new')}
          >
            New
          </button>
          <button
            className={`p-2 rounded-lg ${action === 'edit' ? 'bg-b-blue-500' : 'bg-b-black-300'} text-b-white-100 transition-all duration-300`}
            onClick={() => handleModifierClick('edit')}
          >
            Edit
          </button>
          <button
            className={`p-2 rounded-lg ${action === 'remove' ? 'bg-b-blue-500' : 'bg-b-black-300'} text-b-white-100 transition-all duration-300`}
            onClick={() => handleModifierClick('remove')}
          >
            Remove
          </button>
        </div>

        {/* Target Buttons */}
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-lg ${target === 'task' ? 'bg-b-orange-400' : 'bg-b-black-300'} text-b-white-100 transition-all duration-300`}
            onClick={() => handleTargetClick('task')}
          >
            <FontAwesomeIcon icon={faClipboardList} />
          </button>
          <button
            className={`p-2 rounded-lg ${target === 'event' ? 'bg-b-green-400' : 'bg-b-black-300'} text-b-white-100 transition-all duration-300`}
            onClick={() => handleTargetClick('event')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
          </button>
        </div>

        {/* Clear Chat Button */}
        
      </div>

      {/* Input area */}
      <div className="flex mt-2 shadow-md bg-b-black-100 shadow-b-black-100 rounded-lg  p-2 space-x-2">
        <input
          type="text"
          className="flex-grow p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your command here..."
        />
        <button onClick={handleClearChat} className="p-2  text-b-black-500 rounded-lg">
          <FontAwesomeIcon icon={faBroom} />
        </button>
        <button
          className="p-2 bg-b-blue-500 hover:bg-b-orange-300 transition-all text-b-white-100 rounded-lg ml-2"
          onClick={() => handleSend()}
        >
          Send
        </button>
      </div>

      {/* Popup modal for editing or removing, if needed */}
      {showPicker && (
        <SelectorModal title={pickerTitle} onClose={() => setShowPicker(false)}>
          <div className="p-4">
            {pickerItems.map((item: Task, idx: number) => (
              <div
                key={item.id || idx}
                className="p-2 border rounded my-1 hover:bg-gray-200 cursor-pointer"
                onClick={() => handlePickerSelect(item)}
              >
                {item.title} - {new Date(item.dueDate).toLocaleDateString()}
              </div>
            ))}
          </div>
        </SelectorModal>
      )}
    </div>
  )
}

export default Chat
