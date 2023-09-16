import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchInput } from './SearchInput';
import './search.css';
import { useHistoryStore } from '../store';
import { SearchResults } from './SearchResults';
import { ControllerEvents } from '../../types';

function useFilteredHistory(searchText: string) {
  const history = useHistoryStore((state) => state.history);
  return history
    .filter((entry) => {
      if (searchText === '') {
        return true;
      }
      const search = searchText.toLowerCase();
      return (
        entry.title.toLowerCase().includes(search) ||
        entry.url.toLowerCase().includes(search)
      );
    })
    .slice(0, 10);
}

function onNextFrame(callback: () => void) {
  setTimeout(() => requestAnimationFrame(callback));
}

function Search() {
  const ref = useRef<HTMLDivElement>(null);
  const searchText = useHistoryStore((state) => state.query);
  const setSearchText = useHistoryStore((state) => state.setQuery);
  const history = useFilteredHistory(searchText);
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(event.target.value);
    },
    [setSearchText]
  );

  function updateSize() {
    onNextFrame(() => {
      window.electron.ipcRenderer.sendMessage(ControllerEvents.RESIZE_WINDOW, [
        ref.current.scrollWidth,
        ref.current.scrollHeight,
      ]);
    });
  }

  useEffect(() => onNextFrame(updateSize));
  // useEffect(() => onNextFrame(updateSize), [history, searchText]);

  return (
    <div ref={ref} className="search-container draggable-area">
      <div className="search-input-container">
        <SearchInput text={searchText} onChange={onChange} />
        <div className="search-filterline">
          <ul>
            <li className="filterline-entry">All</li>
            <li className="filterline-entry">gdocs</li>
          </ul>
        </div>
        <SearchResults searchText={searchText} history={history} />
      </div>
    </div>
  );
}

export default Search;
