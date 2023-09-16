import { Database, OPEN_READONLY } from 'sqlite3';
import os from 'os';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import { BrowserHistory, Entries } from 'types';

const log = (message?: any, ...optionalParams: any[]) => {
  console.log(`[☄️] ${message}`, ...optionalParams);
};

const expandHomeDir = (filepath: string) => {
  const homedir = os.homedir();
  return filepath.replace('~', homedir);
};

async function querySQLiteDB<T>(dbpath: string, query: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const db = new Database(dbpath, OPEN_READONLY, (err) => {
      if (err) {
        log(err.message);
      }
      log(`Connected to the ${dbpath} database.`);
    });
    db.serialize(() => {
      db.all(query, (err, row) => {
        if (err) {
          log(err.message);
        }
        resolve(row);
      });
    });
    db.close((err) => {
      if (err) {
        log(err.message);
        reject(err.message);
      }
      log('Close the database connection.');
    });
  });
}

type Browser =
  | 'arc'
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'opera'
  | 'brave'
  | 'vivaldi'
  | 'chromium'
  | 'edge';

type BrowserHistoryDBSchema = Record<Browser, { path: string; query: string }>;

const browserHistoryDBSchema: BrowserHistoryDBSchema = {
  arc: {
    path: expandHomeDir(
      '~/Library/Application Support/Arc/User Data/Default/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
  chrome: {
    path: expandHomeDir(
      '~/Library/Application Support/Google/Chrome/Default/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
  firefox: {
    path: expandHomeDir(
      '~/Library/Application Support/Firefox/Profiles/**/places.sqlite'
    ),
    query: `SELECT * FROM moz_places ORDER BY visit_count DESC`,
  },
  safari: {
    path: expandHomeDir('~/Library/Safari/History.db'),
    query: `SELECT * FROM history_items INNER JOIN history_visits ON history_items.id = history_visits.history_item ORDER BY visit_count DESC`,
  },
  opera: {
    path: expandHomeDir(
      '~/Library/Application Support/com.operasoftware.Opera/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
  brave: {
    path: expandHomeDir(
      '~/Library/Application Support/BraveSoftware/Brave-Browser/Default/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
  edge: {
    path: expandHomeDir(
      '~/Library/Application Support/Microsoft Edge/Default/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
  vivaldi: {
    path: expandHomeDir(
      '~/Library/Application Support/Vivaldi/Default/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
  chromium: {
    path: expandHomeDir(
      '~/Library/Application Support/Chromium/Default/History'
    ),
    query: 'SELECT * FROM urls ORDER BY visit_count DESC',
  },
};

export type BrowserHistoryRecord = Record<Browser, BrowserHistory[]>;

function writeToTempDir(fileOrigin: string, filename: string) {
  const target = path.join(os.tmpdir(), filename);
  log(`Copying ${filename} to ${target}`);
  fs.copyFileSync(fileOrigin, target);
}

function copyBrowserHistoriesToTempDir(schema: BrowserHistoryDBSchema) {
  for (const [key, value] of Object.entries(
    schema
  ) as Entries<BrowserHistoryDBSchema>) {
    // handle cases where the path is not known and uses a glob
    if (value.path.includes('*')) {
      const files = glob.sync(value.path);
      for (let i = 0; i < files.length; i++) {
        if (!fs.existsSync(files[i])) {
          continue;
        }
        writeToTempDir(files[i], `${key}-meteor-history-${i}`);
      }
    } else {
      if (!fs.existsSync(value.path)) {
        continue;
      }
      writeToTempDir(value.path, `${key}-meteor-history-0`);
    }
  }
}

function cleanupTempDir() {
  for (const file of glob.sync(path.join(os.tmpdir(), '*-meteor-history-*'))) {
    fs.unlinkSync(file);
  }
}

export async function collateBrowserHistories(
  schema: BrowserHistoryDBSchema = browserHistoryDBSchema
): Promise<BrowserHistoryRecord> {
  copyBrowserHistoriesToTempDir(schema);
  const historyRecords: BrowserHistoryRecord = {
    arc: [],
    chrome: [],
    firefox: [],
    safari: [],
    opera: [],
    brave: [],
    vivaldi: [],
    chromium: [],
    edge: [],
  };
  for (const history of glob.sync(
    path.join(os.tmpdir(), '*-meteor-history-*')
  )) {
    const key = history.split('-')[0].split('/').at(-1) as Browser;
    try {
      const results = await querySQLiteDB<BrowserHistory>(
        history,
        schema[key].query
      );
      log(`Read ${history} successfully`);
      historyRecords[key] = results;
    } catch (err) {
      log(`Could not read ${history} '${err?.message ?? err}'`);
    }
  }
  cleanupTempDir();
  return historyRecords;
}

async function introspectBrowserHistory(
  browser: keyof typeof browserHistoryDBSchema,
  query = `SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name`
) {
  const value = browserHistoryDBSchema[browser];
  if (!fs.existsSync(value.path)) {
    throw new Error('File does not exist');
  }
  const filename = `${browser}-meteor-history-debug`;
  writeToTempDir(value.path, filename);

  const result = await querySQLiteDB(path.join(value.path, filename), query);
  log(`Introspected ${browser} successfully:`, result);
  return result;
}
