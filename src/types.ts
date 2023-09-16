export type None = null | undefined;

export type Nullable<T> = T | None;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export enum ControllerEvents {
  FETCH_BROWSER_HISTORY = 'fetch-browser-history',
  OPEN_URL = 'open-url',
  RESIZE_WINDOW = 'resize-window',
  SHOW_SEARCH_OMNIBOX = 'show-search-omnibox',
  HIDE_SEARCH_OMNIBOX = 'hide-search-omnibox',
}

export type BrowserHistory = {
  id: number;
  url: string;
  title: string;
  visit_count: number;
  typed_count: number;
  last_visit_time: number;
  hidden: number;
};
