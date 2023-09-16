import { useCallback, useEffect, useState } from 'react';
import { useHistoryStore } from 'renderer/store';
import { BrowserHistory, ControllerEvents } from 'types';

interface SearchResultsProps {
  history: BrowserHistory[];
}

export function SearchResults({ history }: SearchResultsProps) {
  const selectedRow = useHistoryStore((state) => state.selectedRow);
  const incrementSelectedRow = useHistoryStore(
    (state) => state.incrementSelectedRow
  );
  const decrementSelectedRow = useHistoryStore(
    (state) => state.decrementSelectedRow
  );
  const setQuery = useHistoryStore((state) => state.setQuery);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const entry = history[selectedRow];
        if (entry) {
          window.electron.ipcRenderer.sendMessage(
            ControllerEvents.OPEN_URL,
            entry.url
          );
          setQuery('');
        }
      }

      if (event.key === 'ArrowDown') {
        incrementSelectedRow();
      }
      if (event.key === 'ArrowUp') {
        decrementSelectedRow();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [history, selectedRow]);

  const onClick = useCallback(
    (entry: any, i: number) => () => {
      if (i === selectedRow) {
        window.electron.ipcRenderer.sendMessage('open-url', entry.url);
      }
    },
    [selectedRow]
  );

  return (
    <ul className="result-container">
      {history.map((entry, i) => (
        <li
          className={`${selectedRow === i && 'active'}`}
          onClick={onClick(entry, i)}
        >
          <span className="result-heading">{entry.title}</span>
          <span className="result-subtext">{entry.url}</span>
        </li>
      ))}
    </ul>
  );
}
