/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { BrowserHistory } from 'types';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function calculateFrecency(
  history: BrowserHistory,
  currentTime: number
): number {
  // Set the weights for the different factors that contribute to the frecency score
  const visitWeight = 100;
  const typedWeight = 10;
  const ageWeight = 10;
  const age = (currentTime - history.last_visit_time) / (1000 * 60 * 60 * 24);

  // default visit count and typed count to -1 if they are undefined, null or 0
  const visitCount = history.visit_count ?? -1;
  const typedCount = history.typed_count ?? -1;

  if (visitCount <= 0 || typedCount <= 0) {
    return 0;
  }

  // Calculate the frecency score using the weights and age
  const frecency =
    visitCount * visitWeight + typedCount * typedWeight - age * ageWeight;

  return frecency;
}

export function normalizeHistoryTimestamps(
  entry: BrowserHistory & {
    last_visit_date?: number;
    visit_time?: number;
  }
): BrowserHistory {
  // convert safari's odd timestamp format to milliseconds
  // https://stackoverflow.com/questions/34167003/what-format-is-the-safari-history-db-history-visits-visit-time-in
  if ('visit_time' in entry && entry.visit_time) {
    entry.last_visit_time = (entry.visit_time + 978307200) * 1000 ?? -1;
  }

  if ('last_visit_date' in entry) {
    entry.last_visit_time = entry.last_visit_date ?? -1;
  }

  // convert webkit's stupid timestamp format to milliseconds (they use an epoch of 1601!!!???)
  if (entry.last_visit_time.toString().length > 13) {
    const epoch = new Date(1601, 0, 1, 0, 0, 0);
    epoch.setSeconds(entry.last_visit_time / 1000000);
    entry.last_visit_time = epoch.getTime();
    return entry;
  }

  // convert seconds to milliseconds
  if (entry.last_visit_time.toString().length < 13) {
    entry.last_visit_time *= 1000;
  }

  // firefox and other browsers using a microsecond timestamp
  if (entry.last_visit_time > Date.now()) {
    entry.last_visit_time = Math.floor(entry.last_visit_time / 1000);
  }

  return entry;
}
