import React, { useState, useEffect, useRef } from 'react';
import { loadTodosFromLocalStorage, saveTodosToLocalStorage } from '../utils/localStorageUtils'; // Update import path
import { loadEventsFromLocalStorage } from '@renderer/pages/Calendar';
import ReactMarkdown from 'react-markdown';
import CompactTodoItem from './CompactTodoItem';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroom } from '@fortawesome/free-solid-svg-icons';

interface Message {
  sender: 'user' | 'bot';
  content: string | (string | JSX.Element)[];
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  project: string;
  tags: string[];
  icon: any;
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
  const createTaskRef = useRef<(taskDetails: Task) => void>();

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

    const chatGPTKey = localStorage.getItem('chatGPTKey') || '';
    const userMessage: Message = { sender: 'user', content };
    setMessages((prev) => [...prev, userMessage]);

    const { tasks, events } = fetchTasksAndEvents();
    const formattedData = formatTasksAndEvents(tasks, events);
    const finalPrompt = `${brandStylePrompt}\n${formattedData}\nUser: ${content}\nAI:`;
    console.log('Final Prompt:', finalPrompt);

    try {
      const response = await (window.api as any).fetchOpenAIResponse(finalPrompt, chatGPTKey);

      console.log('ChatGPT Response:', response);

      let botMessage: Message = { sender: 'bot', content: [] };

      const jsonMatch = response.match(/{[^}]+}/g);
      if (jsonMatch) {
        console.log('Matched JSON objects:', jsonMatch);
        const taskDetailsArray = parseTaskDetails(jsonMatch.join(''));
        console.log('Parsed Task Details:', taskDetailsArray);

        if (createTaskRef.current) {
          const existingTasks = loadTodosFromLocalStorage();
          const newTasks: Task[] = [];
          const existingTaskDetails: Task[] = [];

          taskDetailsArray.forEach(taskDetails => {
            const existingTask = existingTasks.find(task => task.id === taskDetails.id);
            if (existingTask) {
              existingTaskDetails.push(existingTask);
            } else {
              if (createTaskRef.current) {
                createTaskRef.current(taskDetails);
              }
              newTasks.push(taskDetails);
              console.log('Task created:', taskDetails);
            }
          });

          const updatedContent = response.split('\n').map((line) => {
            const match = line.match(/{[^}]+}/);
            if (match) {
              const jsonObject = JSON.parse(match[0]);
              if (jsonObject.UUID) {
                const task = existingTasks.find(task => task.id === jsonObject.UUID);
                if (task) {
                  return (
                    <CompactTodoItem key={task.id} title={task.title} description={task.description} dueDate={task.dueDate} completed={task.completed} project={task.project} tags={task.tags} onToggle={() => { } } onUpdate={() => { } } onSave={() => { } } selectedIcon={task.icon} projectColor={''} />
                  );
                }
              } else {
                const taskDetails = jsonObject;
                const task = existingTasks.find(task => task.id === taskDetails.id) || newTasks.find(task => task.id === taskDetails.id);
                if (task) {
                  return (
                    <CompactTodoItem key={task.id} title={task.title} description={task.description} dueDate={task.dueDate} completed={task.completed} project={task.project} tags={task.tags} onToggle={() => { } } onUpdate={() => { } } onSave={() => { } } selectedIcon={task.icon} projectColor={''} />
                  );
                }
              }
            }
            return line.replace(/{[^}]+}/g, '');
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
          content: [response.replace(/{[^}]+}/g, '')]
        };
      }

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      if (error && error.message && error.message.includes('Unexpected token')) {
        alert('Received an HTML error page from the server—your backend may be down or misconfigured.');
      }
      console.error('Error fetching response from ChatGPT:', error);
    }

    setInput('');
  };

  const parseTaskDetails = (jsonString: string) => {
    try {
      console.log('Parsing JSON string:', jsonString);

      const jsonObjects = jsonString.match(/{[^}]+}/g);
      if (!jsonObjects) {
        throw new Error('No valid JSON objects found');
      }

      return jsonObjects.map(jsonObject => {
        console.log('Parsing JSON object:', jsonObject);
        const taskDetails = JSON.parse(jsonObject);
        if (taskDetails.id === 'placeholder-id') {
          taskDetails.id = uuidv4();
        }
        if (!taskDetails.dueDate || !taskDetails.title) {
          console.warn('Skipping invalid task details:', taskDetails);
          return null;
        }
        return {
          ...taskDetails,
          dueDate: taskDetails.dueDate && !isNaN(new Date(taskDetails.dueDate).getTime()) ? taskDetails.dueDate : new Date().toISOString(),
          project: taskDetails.project || 'No Project',
        };
      }).filter(task => task !== null);
    } catch (error) {
      console.error('Error parsing JSON string:', error);
      return [];
    }
  };

  const createTask = (taskDetails: Task) => {
    const tasks = loadTodosFromLocalStorage();
    const updatedTaskDetails = {
      ...taskDetails,
      id: taskDetails.id === 'placeholder-id' ? uuidv4() : taskDetails.id,
    };
    const updatedTasks = [...tasks, updatedTaskDetails];
    saveTodosToLocalStorage(updatedTasks);
    console.log('Task saved to local storage:', updatedTaskDetails);
  };

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