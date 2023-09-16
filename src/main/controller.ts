import { ipcMain, shell } from 'electron';
import {
  BrowserHistoryRecord,
  collateBrowserHistories,
} from './datasources/browser-history/chrome';
import { BrowserHistory, ControllerEvents, Entries, Nullable } from '../types';
import { calculateFrecency, normalizeHistoryTimestamps } from './util';

export type Event<T> = { type: ControllerEvents; payload?: T };

interface Model {
  browserHistory: {
    lastUpdated: number;
    entries: Nullable<BrowserHistoryRecord>;
  };
}

const model: Model = {
  browserHistory: {
    lastUpdated: 0,
    entries: null,
  },
};

export function emit<T>(event: Event<T>): void {
  ipcMain.emit(event.type, event.payload);
}

function flattenBrowserHistoryRecord(record: BrowserHistoryRecord): any[] {
  const result = [];

  for (const [key, value] of Object.entries(
    record
  ) as Entries<BrowserHistoryRecord>) {
    const filtered = value
      .filter((entry) => entry && entry.url)
      .map(normalizeHistoryTimestamps)
      .filter(
        (entry) => !excludedUrlParts.some((value) => entry.url.includes(value))
      );
    result.push(...filtered);
  }
  return result
    .filter((value, index, self) => {
      return self.findIndex((v) => v.url === value.url) === index;
    })
    .map(
      // calculate frecency score based on last_visit_time, visit_count, and typed_count
      (entry) => {
        const { title, last_visit_time, visit_count, typed_count, url } = entry;
        const now = Date.now();
        const domain = url
          .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
          .split('/')[0];
        return {
          url: url.replace(/\/$/, ''),
          title,
          domain,
          typed_count,
          visit_count,
          last_visit_time,
          frecencyScore: calculateFrecency(entry, now),
        };
      }
    )
    .filter((value) => value.frecencyScore > 0)
    .sort((a, b) => b.frecencyScore - a.frecencyScore);
}

ipcMain.on(ControllerEvents.OPEN_URL, (event, url: string) => {
  shell.openExternal(url);
});

ipcMain.on(ControllerEvents.FETCH_BROWSER_HISTORY, async (event, arg) => {
  if (
    Date.now() - model.browserHistory.lastUpdated < 1000 * 60 * 10 &&
    model.browserHistory.entries
  ) {
    event.reply(
      ControllerEvents.FETCH_BROWSER_HISTORY,
      JSON.stringify(flattenBrowserHistoryRecord(model.browserHistory.entries))
    );
    return;
  }
  const history = await collateBrowserHistories();
  model.browserHistory.lastUpdated = Date.now();
  model.browserHistory.entries = history;
  event.reply(
    ControllerEvents.FETCH_BROWSER_HISTORY,
    JSON.stringify(flattenBrowserHistoryRecord(history))
  );
});
