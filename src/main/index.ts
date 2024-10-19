import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { createRequire } from 'node:module';
import path from 'node:path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file if not already set
if (!process.env.OPENAI_API_KEY) {
  dotenv.config({ path: join(app.getAppPath(), '.env') });
}

const require = createRequire(import.meta.url);

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: \'My API Key\' }).');
}
const openai = new OpenAI(apiKey);

function createWindow(): void {
  const iconPath = process.platform === 'darwin'
    ? join(__dirname, '../assets/butterfly.icns') // macOS icon
    : join(__dirname, '../assets/butterfly.ico'); // Windows icon

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      webSecurity: false, // Disable web security to allow data URIs
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'";
      document.getElementsByTagName('head')[0].appendChild(meta);
    `);
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

ipcMain.handle('fetch-openai-response', async (event, input) => {
  if (!apiKey) {
    throw new Error('The OPENAI_API_KEY environment variable is missing or empty.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: "system", content: "Butterfly is a helpful productivity assistant" }, 
        { role: 'user', content: "I have to finish a project report today, but I don’t know where to start." },
        { role: "system", content: "Let’s break it down. First, start by outlining the sections of the report. Once the outline is ready, move on to filling in the details for the introduction. After that, focus on one section at a time, starting with the easiest. I’ll help keep track of your progress and remind you to take breaks. Does that sound good?" }, 
        { role: 'user', content: "What tasks do I have due today?" },
        { role: "system", content: 'You have one task due today! {"UUID" : "0c389dd1f-9341-4c49-a186-495b4b287b72"}' },
        { role: 'user', content: "What tasks do I have due this week?" },
        { role: 'system', content: 'You have a few tasks due this week: Task 1: {"UUID": "4a84d6d8-6cc0-4d1e-aedf-5405655a0f3a"}, Task 2: {"UUID": "293d7549-e611-468b-9df5-61d7afff54ca"}  If you need more details on any task, just let me know! Remember to take one step at a time, and you’re doing great!' },
        { role: 'user', content: "Create task: create mockup logo for startup" },
        { role: 'system', content: 'A task has been created: {"id": "placeholder-id", "title": "Create Mockup Logo for Startup", "description": "Design a mockup logo for the startup project. Make sure to explore different variations and concepts.", "dueDate": "2024-09-16T12:00:00.000Z", "tags": ["design", "branding", "logo"], "completed": false' },
        { role: 'user', content: input },
      ],
      temperature: 0.7,
    });

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content.trim();
    } else {
      throw new Error('No response from OpenAI Assistant');
    }
  } catch (error) {
    throw new Error(`Error fetching response from OpenAI Assistant: ${error.message}`);
  }
});

ipcMain.handle('create-task', async (event, taskDetails) => {
  // Implement logic to create a task
  // You can use the `taskDetails` to create a task in the Todo component
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);