// scripts/capture.mjs
import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture({ url, out='screenshot.png', width=1440, height=900, dpr=3, transparent=false, selector=null }={}) {
  const win = new BrowserWindow({
    width, height, show: false,
    backgroundColor: transparent ? '#00000000' : '#ffffff',
    webPreferences: { offscreen: true, contextIsolation: true, nodeIntegration: false }
  });

  await win.loadURL(url);

  win.webContents.enableDeviceEmulation({
    screenPosition: 'desktop',
    deviceScaleFactor: dpr,
    screenSize: { width, height },
    viewPosition: { x: 0, y: 0 },
    viewSize: { width, height },
    scale: 1
  });

  await win.webContents.executeJavaScript(`
    (async () => {
      if (document.fonts?.ready) { await document.fonts.ready; }
      document.documentElement.setAttribute('data-screenshot','true');
      const s = document.createElement('style');
      s.textContent = '*{animation:none!important;transition:none!important} ::selection{background:transparent!important}';
      document.head.appendChild(s);
      await new Promise(r=>setTimeout(r,200));
      return true;
    })();
  `);

  let image;
  if (selector) {
    const rect = await win.webContents.executeJavaScript(`
      (function(){
        const el = document.querySelector(${JSON.stringify(selector)});
        if(!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
      })();
    `);
    if (!rect) throw new Error('Selector not found: ' + selector);
    image = await win.webContents.capturePage(rect);
  } else {
    image = await win.webContents.capturePage();
  }

  const outPath = path.resolve(process.cwd(), out);
  fs.writeFileSync(outPath, image.toPNG());
  win.destroy();
  return outPath;
}

const args = Object.fromEntries(process.argv.slice(2).map(p => {
  const [k, ...rest] = p.split('=');
  return [k.replace(/^--/, ''), rest.join('=')];
}));
process.on('uncaughtException', err => {
  console.error(err);
  app.quit();
});
await app.whenReady();
try {
  const saved = await capture({
    url: args.url || 'http://localhost:5173/#/dashboard',
    out: args.out || 'butterfly@3x.png',
    width: Number(args.width || 1728),
    height: Number(args.height || 1117),
    dpr: Number(args.dpr || 3),
    transparent: String(args.transparent || 'false') === 'true',
    selector: args.selector || null
  });
  console.log('Saved:', saved);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  app.quit();
}