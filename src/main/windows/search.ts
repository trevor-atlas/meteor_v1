import {
  app,
  BrowserView,
  BrowserWindow,
  ipcMain,
  MenuItem,
  shell,
} from 'electron';
import { resolveHtmlPath } from '../util';
import path from 'path';
import { WindowConfig } from './window-types';
import MenuBuilder from '../menu';
import { ControllerEvents } from '../../types';

export function createSearchWindow({ getAssetPath }: WindowConfig) {
  let searchWindow = new BrowserWindow({
    show: false,
    width: 512,
    height: 128,
    alwaysOnTop: true,
    closable: false,
    maximizable: false,
    minimizable: false,
    useContentSize: true,
    resizable: true,
    transparent: true,
    frame: false,
    titleBarOverlay: false,
    icon: getAssetPath('icon.png'),
    thickFrame: false,
    skipTaskbar: true,
    paintWhenInitiallyHidden: true,
    center: true,
    webPreferences: {
      devTools: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../../.erb/dll/preload.js'),
    },
  });

  const view = new BrowserView();
  searchWindow.setBrowserView(view);
  searchWindow.loadURL(resolveHtmlPath('index.html'));

  view.setBounds({ x: 0, y: 0, width: 800, height: 600 });
  view.setAutoResize({ width: true, height: true });

  searchWindow.setBackgroundColor('rgba(0, 0, 0, 0)');

  searchWindow.on('ready-to-show', () => {
    if (!searchWindow) {
      throw new Error('"searchWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      searchWindow.minimize();
    } else {
      // searchWindow.show();
    }
  });

  searchWindow.on('focus', () => {});

  searchWindow.on('blur', () => {
    ipcMain.emit(ControllerEvents.HIDE_SEARCH_OMNIBOX);
    searchWindow.hide();
  });

  searchWindow.on('closed', () => {
    searchWindow = null;
  });

  const menuBuilder = new MenuBuilder(searchWindow);
  menuBuilder.buildMenu([
    new MenuItem({
      label: 'Dismiss',
      role: 'help',
      accelerator: 'Esc',
      click: () => {
        searchWindow.hide();
      },
    }),
  ]);

  // Open urls in the user's browser
  searchWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  return searchWindow;
}
