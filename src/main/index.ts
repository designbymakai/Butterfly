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
  // If a personal API key is provided and non-empty, use it.
  if (userApiKey && userApiKey.trim()) {
    const projectKey = userApiKey.trim();
    const additionalHeaders: Record<string, string> = {};
    if (projectKey.startsWith('sk-proj-')) {
      additionalHeaders['OpenAI-Project'] = process.env.OPENAI_PROJECT_ID || '';
    }
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${projectKey}`,
          ...additionalHeaders
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Butterfly is a helpful productivity assistant' },
            {
              role: 'user',
              content: 'I have to finish a project report today, but I don’t know where to start.'
            },
            {
              role: 'system',
              content:
                'Let’s break it down. First, start by outlining the sections of the report. Once the outline is ready, move on to filling in the details for the introduction. After that, focus on one section at a time, starting with the easiest. I’ll help keep track of your progress and remind you to take breaks. Does that sound good?'
            },
            { role: 'user', content: 'What tasks do I have due today?' },
            {
              role: 'system',
              content:
                'You have one task due today! {"UUID" : "0c389dd1f-9341-4c49-a186-495b4b287b72"}'
            },
            { role: 'user', content: 'What tasks do I have due this week?' },
            {
              role: 'system',
              content:
                'You have a few tasks due this week: Task 1: {"UUID": "4a84d6d8-6cc0-4d1e-aedf-5405655a0f3a"}, Task 2: {"UUID": "293d7549-e611-468b-9df5-61d7afff54ca"}  If you need more details on any task, just let me know! Remember to take one step at a time, and you’re doing great!'
            },
            { role: 'user', content: 'Create task: create mockup logo for startup' },
            {
              role: 'system',
              content:
                'A task has been created: {"id": "placeholder-id", "title": "Create Mockup Logo for Startup", "description": "Design a mockup logo for the startup project. Make sure to explore different variations and concepts.", "dueDate": "2024-09-16T12:00:00.000Z", "tags": ["design", "branding", "logo"], "completed": false}'
            },
            { role: 'user', content: input }
          ],
          temperature: 0.7
        })
      })
      console.log("Request body:", JSON.stringify({
          messages: [
            { role: 'system', content: 'Butterfly is a helpful productivity assistant' },
            // ... other messages ...
            { role: 'user', content: input }
          ],
          temperature: 0.7
        }));
      const rawText = await res.text();
      console.log("Raw response from backend (first 500 chars):", rawText.slice(0, 500));     
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error('Server did not return JSON: ' + rawText);
      }
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('No response from OpenAI Assistant');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching response from OpenAI Assistant: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred');
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
            {
              role: 'user',
              content: 'I have to finish a project report today, but I don’t know where to start.'
            },
            {
              role: 'system',
              content:
                'Let’s break it down. First, start by outlining the sections of the report. Once the outline is ready, move on to filling in the details for the introduction. After that, focus on one section at a time, starting with the easiest. I’ll help keep track of your progress and remind you to take breaks. Does that sound good?'
            },
            { role: 'user', content: 'What tasks do I have due today?' },
            {
              role: 'system',
              content:
                'You have one task due today! {"UUID" : "0c389dd1f-9341-4c49-a186-495b4b287b72"}'
            },
            { role: 'user', content: 'What tasks do I have due this week?' },
            {
              role: 'system',
              content:
                'You have a few tasks due this week: Task 1: {"UUID": "4a84d6d8-6cc0-4d1e-aedf-5405655a0f3a"}, Task 2: {"UUID": "293d7549-e611-468b-9df5-61d7afff54ca"}  If you need more details on any task, just let me know! Remember to take one step at a time, and you’re doing great!'
            },
            { role: 'user', content: 'Create task: create mockup logo for startup' },
            {
              role: 'system',
              content:
                'A task has been created: {"id": "placeholder-id", "title": "Create Mockup Logo for Startup", "description": "Design a mockup logo for the startup project. Make sure to explore different variations and concepts.", "dueDate": "2024-09-16T12:00:00.000Z", "tags": ["design", "branding", "logo"], "completed": false}'
            },
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
