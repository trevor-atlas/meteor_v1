// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ControllerEvents } from './controller';

export type Channels = ControllerEvents;

const electronHandler = {
  ipcRenderer: {
<<<<<<< HEAD
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
||||||| parent of de9a30f (init)
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
=======
    sendMessage(channel: Channels, args?: unknown[]) {
      ipcRenderer.send(channel, args);
>>>>>>> de9a30f (init)
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
