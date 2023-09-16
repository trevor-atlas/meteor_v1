/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  Tray,
} from 'electron';
import { createWindows } from './windows/global';
import './controller';
import { ControllerEvents } from '../types';

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

let settingsWindow: BrowserWindow | null = null;
let searchWindow: BrowserWindow | null = null;

ipcMain.on(ControllerEvents.RESIZE_WINDOW, (event, [width, height]) => {
  if (!searchWindow) return;
  searchWindow.setSize(Math.ceil(width), Math.ceil(height));
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let tray = null;

app
  .whenReady()
  .then(() => {
    app.dock.hide();

    createWindows({ isDebug, installExtensions })
      .then((windows) => {
        settingsWindow = windows.settingsWindow;
        searchWindow = windows.searchWindow;
        tray = windows.tray;
      })
      .then(() => {
        searchWindow.setSkipTaskbar(true);
        settingsWindow.setSkipTaskbar(true);
        globalShortcut.register('CommandOrControl+Shift+E', () => {
          ipcMain.emit(ControllerEvents.SHOW_SEARCH_OMNIBOX);
          searchWindow.show();
        });
      });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (settingsWindow === null) {
        createWindows({ isDebug, installExtensions });
      }
    });
  })
  .catch(console.log);
