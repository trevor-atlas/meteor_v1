import { createRoot } from 'react-dom/client';
import { BrowserHistory, ControllerEvents } from 'types';
import App from './App';
import { useHistoryStore } from './store';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

window.electron.ipcRenderer.on(
  ControllerEvents.FETCH_BROWSER_HISTORY,
  (arg: string) => {
    const history: BrowserHistory[] = JSON.parse(arg);
    useHistoryStore.getState().updateHistory(history);
  }
);

window.electron.ipcRenderer.sendMessage(ControllerEvents.FETCH_BROWSER_HISTORY);
