import React, { useState, useEffect, useRef } from 'react';
import { loadTodosFromLocalStorage, saveTodosToLocalStorage } from '@renderer/pages/Todo'; // Import saveTodosToLocalStorage
import { loadEventsFromLocalStorage } from '@renderer/pages/Calendar';
import ReactMarkdown from 'react-markdown';
import CompactTodoItem from './CompactTodoItem'; // Import CompactTodoItem
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroom } from '@fortawesome/free-solid-svg-icons';

interface Message {
  sender: 'user' | 'bot';
  content: string | (string | JSX.Element)[]; // Updated to handle mixed content
  tasks?: Task[]; // Optional tasks property
}

interface Task {
  id: string; // Include UUID
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  project: string;
  tags: string[];
}

interface Event {
  title: string;
  description: string;
  start: string;
  end: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const createTaskRef = useRef<(taskDetails: Task) => void | null>(null); // Create a ref for the createTask function

  const fetchTasksAndEvents = () => {
    const tasks: Task[] = loadTodosFromLocalStorage();
    const events: Event[] = loadEventsFromLocalStorage();
    return { tasks, events };
  };

  const formatTasksAndEvents = (tasks: Task[], events: Event[]) => {
    const formattedTasks = JSON.stringify(tasks, null, 2);
    const formattedEvents = JSON.stringify(events, null, 2);
    return `Tasks: ${formattedTasks}\nEvents: ${formattedEvents}`;
  };

  const brandStylePrompt = `You are Butterfly, a friendly and efficient productivity assistant designed to simplify the user’s life. Your role is to help users manage their daily tasks and events by integrating their calendar and email, breaking down their work into manageable subtasks, organizing them into projects, and prioritizing them for a stress-free start to their day.

Always maintain a calm, supportive, and understanding tone. Your primary audience includes neurodivergent individuals, especially those with ADHD, who often face challenges like task paralysis, distraction, and overwhelm. Your goal is to mitigate these struggles by providing a clear, actionable plan that fosters focus and progress.

When responding, be concise, gentle, and positive. Avoid overwhelming users with too much information at once, and use simple, clear language. Encourage them to take one step at a time and offer reassurance when they need it. Every interaction should leave the user feeling empowered, capable, and ready to take on their day.

Key Aspects:

Tone: Friendly, supportive, and calm.
Language: Simple, clear, concise.
Focus: Breaking tasks into manageable steps and providing a clear direction.
Audience: Neurodivergent users, particularly those with ADHD.
Outcome: Empower users, reduce task paralysis, and minimize distractions.
When referencing a task or event to the user, do not include the title or description or any other data attached to it in the initial description. Instead, only provide the UUID of the task or event in JSON format, this will be a long string that is passed to you before each message. This will allow the user to ask for more details if needed. For example, "You have a task due today! {'UUID': '0c389dd1f-9341-4c49-a186-495b4b287b72'}". This will allow for the system to display the task details in full. If the user asks for any follow up questions you can break down the task further.
When the user asks you to Create a Task, respond in the following format: {
  "id": "placeholder-id",
  "title": "New Task",
  "description": "This is a detailed description of the new task.",
  "dueDate": "2024-09-16T12:00:00.000Z",
  "project": "No Project",
  "tags": ["Example", "work", "tag"],
  "completed": false
  Attempt to use one of the existing projects given, if the task does not seem relevant to any attempt to use "No Project" as the project name.
`;

  const handleSend = async (messageContent?: string) => {
    const content = messageContent || input;
    if (!content.trim()) return;

    const userMessage: Message = { sender: 'user', content };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const { tasks, events } = fetchTasksAndEvents();
    const formattedData = formatTasksAndEvents(tasks, events);
    const finalPrompt = `${brandStylePrompt}\n${formattedData}\nUser: ${content}\nAI:`;
    console.log('Final Prompt:', finalPrompt); // Log the final prompt

    try {
      const response = await window.api.fetchOpenAIResponse(finalPrompt);

      console.log('ChatGPT Response:', response); // Log the entire response

      let botMessage: Message = { sender: 'bot', content: [] };

      // Improved regex pattern to match JSON strings more accurately
      const jsonMatch = response.match(/{[^}]+}/g);
      if (jsonMatch) {
        console.log('Matched JSON objects:', jsonMatch); // Log the matched JSON objects
        const taskDetailsArray = parseTaskDetails(jsonMatch.join(''));
        console.log('Parsed Task Details:', taskDetailsArray); // Log the parsed task details

        if (createTaskRef.current) {
          const existingTasks = loadTodosFromLocalStorage();
          const newTasks = [];
          const existingTaskDetails = [];

          taskDetailsArray.forEach(taskDetails => {
            const existingTask = existingTasks.find(task => task.id === taskDetails.id);
            if (existingTask) {
              existingTaskDetails.push(existingTask);
            } else {
              createTaskRef.current(taskDetails); // Use the ref to call createTask
              newTasks.push(taskDetails);
              console.log('Task created:', taskDetails); // Log the task creation
            }
          });

          // Replace JSON data in the response with CompactTodoItems
          const updatedContent = response.split('\n').map((line, index) => {
            const match = line.match(/{[^}]+}/);
            if (match) {
              const jsonObject = JSON.parse(match[0]);
              if (jsonObject.UUID) {
                const task = existingTasks.find(task => task.id === jsonObject.UUID);
                if (task) {
                  return (
                    <CompactTodoItem key={task.id} todo={task} onToggle={() => {}} onUpdate={() => {}} onSave={() => {}} />
                  );
                }
              } else {
                const taskDetails = jsonObject;
                const task = existingTasks.find(task => task.id === taskDetails.id) || newTasks.find(task => task.id === taskDetails.id);
                if (task) {
                  return (
                    <CompactTodoItem key={task.id} todo={task} onToggle={() => {}} onUpdate={() => {}} onSave={() => {}} />
                  );
                }
              }
            }
            return line.replace(/{[^}]+}/g, ''); // Hide JSON data
          });

          botMessage = {
            sender: 'bot',
            content: updatedContent
          };
        } else {
          console.error('createTaskRef.current is null');
        }
      } else {
        console.log('No JSON match found in response');
        botMessage = {
          sender: 'bot',
          content: [response.replace(/{[^}]+}/g, '')] // Hide JSON data
        };
      }

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response from ChatGPT:', error);
    }

    setInput('');
  };

  const parseTaskDetails = (jsonString: string) => {
    try {
      console.log('Parsing JSON string:', jsonString); // Log the JSON string being parsed

      // Match individual JSON objects in the string
      const jsonObjects = jsonString.match(/{[^}]+}/g);
      if (!jsonObjects) {
        throw new Error('No valid JSON objects found');
      }

      // Parse each JSON object and ensure it contains the required fields
      return jsonObjects.map(jsonObject => {
        console.log('Parsing JSON object:', jsonObject); // Log each JSON object being parsed
        const taskDetails = JSON.parse(jsonObject);
        if (taskDetails.id === 'placeholder-id') {
          taskDetails.id = uuidv4(); // Assign a new UUID if the task has a placeholder-id
        }
        if (!taskDetails.dueDate || !taskDetails.title) {
          console.warn('Skipping invalid task details:', taskDetails);
          return null;
        }
        return {
          ...taskDetails,
          dueDate: taskDetails.dueDate && !isNaN(new Date(taskDetails.dueDate).getTime()) ? taskDetails.dueDate : new Date().toISOString(), // Ensure dueDate is not null
          project: taskDetails.project || 'No Project', // Set default project to "No Project"
        };
      }).filter(task => task !== null); // Filter out invalid tasks
    } catch (error) {
      console.error('Error parsing JSON string:', error);
      return [];
    }
  };

  const createTask = (taskDetails: Task) => {
    const tasks = loadTodosFromLocalStorage();
    const updatedTaskDetails = {
      ...taskDetails,
      id: taskDetails.id === 'placeholder-id' ? uuidv4() : taskDetails.id, // Replace placeholder-id with a new UUID
    };
    const updatedTasks = [...tasks, updatedTaskDetails];
    saveTodosToLocalStorage(updatedTasks);
    console.log('Task saved to local storage:', updatedTaskDetails); // Log the task saving
  };

  // Assign the createTask function to the ref
  useEffect(() => {
    createTaskRef.current = createTask;
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className='flex flex-col justify-center m-auto p-5 overflow-hidden h-full'>
      <div className='flex-grow overflow-y-auto'>
        <div className='flex flex-col'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 pb-2 my-1 rounded ${
                message.sender === 'bot' ? 'rounded-lg bg-b-blue-300 text-left text-b-white-100 shadow-lg' : 'bg-b-white-200 rounded-lg shadow-lg  text-b-black-400 text-right self-end'
              }`}
            >
              {message.sender === 'bot' ? (
                <>
                  {Array.isArray(message.content) ? (
                    message.content.map((part, idx) => (
                      typeof part === 'string' ? <ReactMarkdown key={idx}>{part}</ReactMarkdown> : part
                    ))
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
                </>
              ) : (
                message.content
              )}
            </div>
          ))}
        </div>
      </div>
      <div className='flex flex-col pt-4 sticky bottom-0'>
        <div className='flex justify-between mb-2'>
          <div className='flex space-x-2'>
            <button
              onClick={() => setInput('Create Task:')}
              className='p-2 bg-b-blue-100 text-white rounded-lg'
            >
              New Task
            </button>
            <button
              onClick={() => handleSend('Tasks due this week')}
              className='p-2 bg-b-blue-100 text-white rounded-lg'
            >
              Upcoming Tasks
            </button>
            <button
              onClick={() => handleSend('Prioritise my tasks for today')}
              className='p-2 bg-b-blue-100 text-white rounded-lg'
            >
              Prioritise Tasks
            </button>
          </div>
          <button
            onClick={handleClearChat}
            className='p-2 bg-b-red-300 text-b-black-300 rounded-lg'
          >
            <FontAwesomeIcon icon={faBroom} />
          </button>
        </div>
        <div className='flex'>
          <input
            className='rounded-lg p-2 flex-grow text-b-orange-300 bg-b-white-200 border-b-2 border-b-white-300'
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={() => handleSend()} className='ml-5 p-2 bg-b-orange-300 text-white rounded-lg'>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;