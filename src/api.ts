/* Common */
import { EventEmitter } from 'events';
import { IFilter, Entry, Platform } from './types';

/* Android */
import AndroidFilter from './android/AndroidFilter';
import AndroidParser from './android/AndroidParser';
import { runAndroidLoggingProcess } from './android/adb';
export { Priority as AndroidPriority } from './android/constants';

/* iOS */
import IosParser from './ios/IosParser';
import IosFilter from './ios/IosFilter';
import { runSimulatorLoggingProcess } from './ios/simulator';
import { CodeError, ERR_IOS_NO_SIMULATORS_BOOTED } from './errors';
export { Priority as IosPriority } from './ios/constants';

/* Exports */
export { formatEntry, formatError } from './formatters';
export { Entry } from './types';

export type LogkittyOptions = {
  platform: Platform;
  adbPath?: string;
  priority?: number;
  filter?: FilterCreator;
};

export type FilterCreator = (
  platform: Platform,
  minPriority?: number,
  adbPath?: string
) => IFilter;

export function makeTagsFilter(...tags: string[]): FilterCreator {
  return (platform: Platform, minPriority?: number) => {
    const filter =
      platform === 'android'
        ? new AndroidFilter(minPriority)
        : new IosFilter(minPriority);
    filter.setFilterByTag(tags);
    return filter;
  };
}

export function makeAppFilter(appIdentifier: string): FilterCreator {
  return (platform: Platform, minPriority?: number, adbPath?: string) => {
    if (platform !== 'android') {
      throw new Error('App filter is only available for Android');
    }

    const filter = new AndroidFilter(minPriority);
    filter.setFilterByApp(appIdentifier, adbPath);
    return filter;
  };
}

export function makeMatchFilter(...regexes: RegExp[]): FilterCreator {
  return (platform: Platform, minPriority?: number) => {
    const filter =
      platform === 'android'
        ? new AndroidFilter(minPriority)
        : new IosFilter(minPriority);
    filter.setFilterByMatch(regexes);
    return filter;
  };
}

export function makeCustomFilter(...patterns: string[]): FilterCreator {
  return (platform: Platform, minPriority?: number) => {
    if (platform !== 'android') {
      throw new Error('Custom filter is only available for Android');
    }

    const filter = new AndroidFilter(minPriority);
    filter.setCustomFilter(patterns);
    return filter;
  };
}

export function logkitty(options: LogkittyOptions): EventEmitter {
  const { platform, adbPath, priority, filter: createFilter } = options;
  const emitter = new EventEmitter();

  if (
    !['ios', 'android'].some(
      availablePlatform => availablePlatform === platform
    )
  ) {
    throw new Error(`Platform ${platform} is not supported`);
  }

  const parser = platform === 'android' ? new AndroidParser() : new IosParser();
  let filter: IFilter;
  if (createFilter) {
    filter = createFilter(platform, priority, adbPath);
  } else {
    filter =
      platform === 'android'
        ? new AndroidFilter(priority)
        : new IosFilter(priority);
  }

  const loggingProcess =
    platform === 'android'
      ? runAndroidLoggingProcess(adbPath)
      : runSimulatorLoggingProcess();

  process.on('exit', () => {
    loggingProcess.kill();
    emitter.emit('exit');
  });

  loggingProcess.stderr?.on('data', (errorData: string | Buffer) => {
    if (
      platform === 'ios' &&
      errorData.toString().includes('No devices are booted.')
    ) {
      emitter.emit(
        'error',
        new CodeError(ERR_IOS_NO_SIMULATORS_BOOTED, 'No simulators are booted.')
      );
    } else {
      emitter.emit('error', new Error(errorData.toString()));
    }
  });

  loggingProcess.stdout?.on('data', (raw: string | Buffer) => {
    let entryToLog: Entry | undefined;
    try {
      const messages = parser.splitMessages(raw.toString());
      const entries = parser.parseMessages(messages);
      entries.forEach((entry: Entry) => {
        if (filter.shouldInclude(entry)) {
          entryToLog = entry;
        }
      });
    } catch (error) {
      emitter.emit('error', error);
    }

    if (entryToLog) {
      emitter.emit('entry', entryToLog);
    }
  });

  loggingProcess.stdout?.on('error', (error: Error) => {
    emitter.emit('error', error);
    emitter.emit('exit');
  });

  return emitter;
}
