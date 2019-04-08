import {
  logkitty,
  Priority,
  makeTagsFilter,
  makeMatchFilter,
  makeCustomFilter,
  makeAppFilter,
} from '../api';
import { runLoggingProcess, getApplicationPid } from '../android/adb';
import { EventEmitter } from 'events';
import { Entry } from '../types';

jest.mock('../android/adb.ts', () => ({
  runLoggingProcess: jest.fn(),
  getApplicationPid: jest.fn(),
}));

const RAW_LOG_FIXTURES = [
  '04-08 00:58:53.967 E/storaged(  934): getDiskStats failed with result NOT_SUPPORTED and size 0',
  '04-08 01:10:54.261 I/chatty  ( 1383): uid=1000(system) ActivityManager expire 10 lines',
  '04-08 01:10:54.990 V/chatty  ( 1383): uid=1000 system_server expire 3 lines',
  '04-08 01:32:25.371 W/wificond(  935): No pno scan started',
  '04-08 01:32:25.371 D/wificond(  935): Scheduled scan is not running!',
];

const PARSED_LOG_FIXTURES = [
  {
    date: new Date('2019-04-07T22:58:53.000Z'),
    pid: 934,
    priority: 5,
    tag: 'storaged',
    messages: ['getDiskStats failed with result NOT_SUPPORTED and size 0'],
  },
  {
    date: new Date('2019-04-07T23:10:54.000Z'),
    pid: 1383,
    priority: 3,
    tag: 'chatty',
    messages: ['uid=1000(system) ActivityManager expire 10 lines'],
  },
  {
    date: new Date('2019-04-07T23:32:25.000Z'),
    pid: 935,
    priority: 4,
    tag: 'wificond',
    messages: ['No pno scan started'],
  },
  {
    date: new Date('2019-04-07T23:32:25.000Z'),
    pid: 935,
    priority: 2,
    tag: 'wificond',
    messages: ['Scheduled scan is not running!'],
  },
];

describe('Node API', () => {
  describe('should spawn logcat process and emit entries', () => {
    it('when no filter is used', (done: Function) => {
      let entriesEmitted = 0;
      const loggingEmitter = new EventEmitter();
      (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
        stdout: loggingEmitter,
      }));

      const emitter = logkitty({
        platform: 'android',
        priority: Priority.INFO,
      });

      emitter.on('entry', (entry: Entry) => {
        switch (entriesEmitted) {
          case 0:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[0]);
            break;
          case 1:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[1]);
            break;
          case 2:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[2]);
            break;
          default:
            throw new Error('should never get here');
        }

        entriesEmitted += 1;
      });

      RAW_LOG_FIXTURES.forEach((data: string) => {
        loggingEmitter.emit('data', data);
      });

      setTimeout(() => {
        expect(entriesEmitted).toBe(3);
        done();
      });
    });

    it('when app filter used', (done: Function) => {
      let entriesEmitted = 0;
      const loggingEmitter = new EventEmitter();
      (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
        stdout: loggingEmitter,
      }));
      (getApplicationPid as jest.Mock).mockImplementationOnce(
        (appId: string) => {
          return appId === 'com.example.app' ? PARSED_LOG_FIXTURES[1].pid : -1;
        }
      );

      const emitter = logkitty({
        platform: 'android',
        priority: Priority.INFO,
        filter: makeAppFilter('com.example.app'),
      });

      emitter.on('entry', (entry: Entry) => {
        expect(entry).toEqual(PARSED_LOG_FIXTURES[1]);
        entriesEmitted += 1;
      });

      RAW_LOG_FIXTURES.forEach((data: string) => {
        loggingEmitter.emit('data', data);
      });

      setTimeout(() => {
        expect(entriesEmitted).toBe(1);
        done();
      });
    });

    it('when tag filter used', (done: Function) => {
      let entriesEmitted = 0;
      const loggingEmitter = new EventEmitter();
      (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
        stdout: loggingEmitter,
      }));

      const emitter = logkitty({
        platform: 'android',
        priority: Priority.VERBOSE,
        filter: makeTagsFilter('wificond', 'storaged'),
      });

      emitter.on('entry', (entry: Entry) => {
        switch (entriesEmitted) {
          case 0:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[0]);
            break;
          case 1:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[2]);
            break;
          case 2:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[3]);
            break;
          default:
            throw new Error('should never get here');
        }

        entriesEmitted += 1;
      });

      RAW_LOG_FIXTURES.forEach((data: string) => {
        loggingEmitter.emit('data', data);
      });

      setTimeout(() => {
        expect(entriesEmitted).toBe(3);
        done();
      });
    });

    it('when match filter used', (done: Function) => {
      let entriesEmitted = 0;
      const loggingEmitter = new EventEmitter();
      (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
        stdout: loggingEmitter,
      }));

      const emitter = logkitty({
        platform: 'android',
        priority: Priority.VERBOSE,
        filter: makeMatchFilter(/scan/),
      });

      emitter.on('entry', (entry: Entry) => {
        switch (entriesEmitted) {
          case 0:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[2]);
            break;
          case 1:
            expect(entry).toEqual(PARSED_LOG_FIXTURES[3]);
            break;
          default:
            throw new Error('should never get here');
        }

        entriesEmitted += 1;
      });

      RAW_LOG_FIXTURES.forEach((data: string) => {
        loggingEmitter.emit('data', data);
      });

      setTimeout(() => {
        expect(entriesEmitted).toBe(2);
        done();
      });
    });

    it('when custom filter used', (done: Function) => {
      let entriesEmitted = 0;
      const loggingEmitter = new EventEmitter();
      (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
        stdout: loggingEmitter,
      }));

      const emitter = logkitty({
        platform: 'android',
        priority: Priority.VERBOSE,
        filter: makeCustomFilter('*:S', 'storaged:I'),
      });

      emitter.on('entry', (entry: Entry) => {
        expect(entry).toEqual(PARSED_LOG_FIXTURES[0]);
        entriesEmitted += 1;
      });

      RAW_LOG_FIXTURES.forEach((data: string) => {
        loggingEmitter.emit('data', data);
      });

      setTimeout(() => {
        expect(entriesEmitted).toBe(1);
        done();
      });
    });
  });

  it('should emit error when parsing fails', (done: Function) => {
    const loggingEmitter = new EventEmitter();
    (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
      stdout: loggingEmitter,
    }));

    const emitter = logkitty({
      platform: 'android',
    });

    emitter.on('error', (error: Error) => {
      expect(error).toBeDefined();
      done();
    });

    loggingEmitter.emit('data', null);
  });

  it('should emit error when process emits error', (done: Function) => {
    const loggingEmitter = new EventEmitter();
    (runLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
      stdout: loggingEmitter,
    }));

    const emitter = logkitty({
      platform: 'android',
    });

    emitter.on('error', (error: Error) => {
      expect(error).toBeDefined();
      done();
    });

    loggingEmitter.emit('error', new Error());
  });
});
