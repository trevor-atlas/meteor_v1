import { app, BrowserWindow, shell } from 'electron';
import { resolveHtmlPath } from '../util';
import path from 'path';
import MenuBuilder from '../menu';
import { WindowConfig } from './window-types';

export function createSettingsWindow({ getAssetPath }: WindowConfig) {
  let mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    alwaysOnTop: true,
    // focusable: false,
    // closable: false,
    maximizable: false,
    minimizable: false,
    // movable: false,
    // titleBarStyle: 'hidden',
    titleBarOverlay: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      // mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  return mainWindow;
}
