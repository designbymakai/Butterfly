import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import fetch from 'node-fetch';

// Load environment variables from .env file if not already set
if (!process.env.OPENAI_API_KEY) {
  dotenv.config({ path: join(app.getAppPath(), '.env') })
}

function createWindow(): void {
  const iconPath =
    process.platform === 'darwin'
      ? join(__dirname, '../assets/butterfly.icns') // macOS icon
      : join(__dirname, '../assets/butterfly.ico') // Windows icon

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      webSecurity: false // Disable web security to allow data URIs
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'";
      document.getElementsByTagName('head')[0].appendChild(meta);
    `)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('fetch-openai-response', async (_, input, userApiKey?) => {
  if (userApiKey && userApiKey.trim()) {
    const projectKey = userApiKey.trim();
    const additionalHeaders: Record<string, string> = {};
    if (projectKey.startsWith('sk-proj-')) {
      additionalHeaders['OpenAI-Project'] = process.env.OPENAI_PROJECT_ID || '';
    }
    try {
      const payload = {
        model: "gpt-3.5-turbo-0613",
        messages: [
          { role: "system", content: "You are Butterfly, a productivity assistant." },
          { role: "user", content: finalPrompt }
        ],
        functions: [
          {
            name: "listTasks",
            description: "Lists all active tasks",
            parameters: { type: "object", properties: {} }
          },
          {
            name: "createTask",
            description: "Creates a new task. Provide task name, due date, project, and a list of tags. The task will be assigned a UUID automatically.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "The title of the task" },
                dueDate: { type: "string", format: "date-time", description: "Due date/time" },
                project: { type: "string", description: "Project name" },
                tags: { type: "array", items: { type: "string" }, description: "List of tags" }
              },
              required: ["title", "dueDate", "project", "tags"]
            }
          },
          {
            name: "updateTask",
            description: "Updates an active task's metadata. Provide the task UUID and any fields to update.",
            parameters: {
              type: "object",
              properties: {
                id: { type: "string", description: "The UUID of the task" },
                title: { type: "string", description: "New title (if updating)" },
                dueDate: { type: "string", format: "date-time", description: "New due date (if updating)" },
                project: { type: "string", description: "New project (if updating)" },
                tags: { type: "array", items: { type: "string" }, description: "Updated list of tags (if updating)" }
              },
              required: ["id"]
            }
          },
          {
            name: "getTaskDetails",
            description: "Retrieves full metadata for a specific task",
            parameters: {
              type: "object",
              properties: { id: { type: "string", description: "The UUID of the task" } },
              required: ["id"]
            }
          },
          {
            name: "createEvent",
            description: "Creates a new event. Provide event title, start time, end time, and an optional description.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "The title of the event" },
                start: { type: "string", format: "date-time", description: "Event start time" },
                end: { type: "string", format: "date-time", description: "Event end time" },
                description: { type: "string", description: "Optional event description" }
              },
              required: ["title", "start", "end"]
            }
          },
          {
            name: "updateEvent",
            description: "Updates an event's details. Provide an event ID and fields to update.",
            parameters: {
              type: "object",
              properties: {
                id: { type: "string", description: "The event ID" },
                title: { type: "string", description: "New title (if updating)" },
                start: { type: "string", format: "date-time", description: "New start time (if updating)" },
                end: { type: "string", format: "date-time", description: "New end time (if updating)" },
                description: { type: "string", description: "New description (if updating)" }
              },
              required: ["id"]
            }
          },
          {
            name: "getEventDetails",
            description: "Retrieves details for a specific event",
            parameters: {
              type: "object",
              properties: { id: { type: "string", description: "The event ID" } },
              required: ["id"]
            }
          }
        ]
      };
      
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${projectKey}`,
          ...additionalHeaders
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
          
          // Step 2: Check if a function call was returned.
      if (data.choices[0].finish_reason === "function_call") {
        const functionCall = data.choices[0].message.function_call;
        const { name, arguments: args } = functionCall;
        console.log("Function call received:", name, args);
            
        // Validate allowed functions.
        const allowedFunctions = ["listTasks", "createTask", "updateTask", "getTaskDetails", "createEvent", "updateEvent", "getEventDetails"];
        if (!allowedFunctions.includes(name)) {
          throw new Error("Unrecognized function call: " + name);
        }
            
        // Route to the corresponding local function and return a clear JSON string.
        if (name === "listTasks") {
          const tasks = loadTodosFromLocalStorage();
          return JSON.stringify({ tasks });
        } else if (name === "createTask") {
          const parsedArgs = JSON.parse(args);
          parsedArgs.id = parsedArgs.id === "placeholder-id" ? uuidv4() : parsedArgs.id;
          createTask(parsedArgs);
          return JSON.stringify({ message: "Task created." });
        } else if (name === "updateTask") {
          const parsedArgs = JSON.parse(args);
          updateTask(parsedArgs);
          return JSON.stringify({ message: "Task updated." });
        } else if (name === "getTaskDetails") {
          const parsedArgs = JSON.parse(args);
          const task = getTaskDetails(parsedArgs.id);
          return JSON.stringify({ task });
        } else if (name === "createEvent") {
          const parsedArgs = JSON.parse(args);
          createEvent(parsedArgs);
          return JSON.stringify({ message: "Event created." });
        } else if (name === "updateEvent") {
          const parsedArgs = JSON.parse(args);
          updateEvent(parsedArgs);
          return JSON.stringify({ message: "Event updated." });
        } else if (name === "getEventDetails") {
          const parsedArgs = JSON.parse(args);
          const eventDetails = getEventDetails(parsedArgs.id);
          return JSON.stringify({ eventDetails });
        }
      } else {
        // Regular assistant response
        return data.choices[0].message.content.trim();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching response from OpenAI Assistant: ${error.message}`);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  } else {
    // No personal key provided; use Render server's endpoint.
    const serverUrl = process.env.RENDER_SERVER_URL || 'https://butterfly-ivb2.onrender.com';
    console.log("Calling backend:", `${serverUrl}/api/chat`);
    try {
      const res = await fetch(`${serverUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // explicitly ask for JSON
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Butterfly is a helpful productivity assistant' },
            // ... other messages ...
            { role: 'user', content: input }
          ],
          temperature: 0.7
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Render server responded with ${res.status}: ${errorText}`);
        throw new Error(`Error fetching response from Render server API: ${res.status}`);
      }
      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('No response from Render server API');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching response from Render server API: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred (server call)');
      }
    }
  }
});


ipcMain.handle('create-task', async (_) => {
  // Implement logic to create a task
  // You can use the `taskDetails` to create a task in the Todo component
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
