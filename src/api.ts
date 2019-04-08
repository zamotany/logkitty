import { IFilter, Entry } from './types';
import { EventEmitter } from 'events';
import { AndroidFilter } from './android/AndroidFilter';
import { runLoggingProcess } from './android/adb';
import AndroidParser from './android/AndroidParser';

export { formatEntry, formatError } from './formatters';
export { Priority } from './android/constants';
export { Entry } from './types';

export type LogkittyOptions = {
  platform: 'android';
  adbPath?: string;
  priority?: number;
  filter?: FilterCreator;
};

export type FilterCreator = (minPriority?: number, adbPath?: string) => IFilter;

export function makeTagsFilter(...tags: string[]): FilterCreator {
  return (minPriority?: number) => {
    const filter = new AndroidFilter(minPriority);
    filter.setFilterByTag(tags);
    return filter;
  };
}

export function makeAppFilter(appIdentifier: string): FilterCreator {
  return (minPriority?: number, adbPath?: string) => {
    const filter = new AndroidFilter(minPriority);
    filter.setFilterByApp(appIdentifier, adbPath);
    return filter;
  };
}

export function makeMatchFilter(...regexes: RegExp[]): FilterCreator {
  return (minPriority?: number) => {
    const filter = new AndroidFilter(minPriority);
    filter.setFilterByMatch(regexes);
    return filter;
  };
}

export function makeCustomFilter(...patterns: string[]): FilterCreator {
  return (minPriority?: number) => {
    const filter = new AndroidFilter(minPriority);
    filter.setCustomFilter(patterns);
    return filter;
  };
}

export function logkitty(options: LogkittyOptions): EventEmitter {
  const { platform, adbPath, priority, filter: createFilter } = options;
  const emitter = new EventEmitter();

  if (platform !== 'android') {
    emitter.emit('error', new Error(`Platform ${platform} is not supported`));
    return emitter;
  }

  const parser = new AndroidParser();
  const filter = createFilter
    ? createFilter(priority, adbPath)
    : new AndroidFilter(priority);
  const loggingProcess = runLoggingProcess(adbPath);

  process.on('exit', () => {
    loggingProcess.kill();
    emitter.emit('exit');
  });

  loggingProcess.stdout.on('data', (raw: string | Buffer) => {
    try {
      const messages = parser.splitMessages(raw.toString());
      const entries = parser.parseMessages(messages);
      entries.forEach((entry: Entry) => {
        if (filter.shouldInclude(entry)) {
          emitter.emit('entry', entry);
        }
      });
    } catch (error) {
      emitter.emit('error', error);
    }
  });

  loggingProcess.stdout.on('error', (error: Error) => {
    emitter.emit('error', error);
    emitter.emit('exit');
  });

  return emitter;
}
