import { app, Menu, Tray } from 'electron';
import path from 'path';
import { AppUpdater } from './AppUpdater';
import { createSearchWindow } from './search';
import { createSettingsWindow } from './settings';
import { CreateWindowsOptions } from './window-types';

export async function createWindows(options: CreateWindowsOptions) {
  const { isDebug, installExtensions } = options;

  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const configuration = {
    ...options,
    getAssetPath,
  };

  const settingsWindow = createSettingsWindow(configuration);
  const searchWindow = createSearchWindow(configuration);
  const tray = new Tray(getAssetPath('/icons/16x16.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('Meteor');
  tray.setContextMenu(contextMenu);
  new AppUpdater();
  return { settingsWindow, searchWindow, tray };
}
