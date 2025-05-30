// global.d.ts

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