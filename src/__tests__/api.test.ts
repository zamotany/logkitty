/* eslint-disable jest/no-test-callback */
import {
  logkitty,
  AndroidPriority,
  makeTagsFilter,
  makeMatchFilter,
  makeCustomFilter,
  makeAppFilter,
} from '../api';
import { runAndroidLoggingProcess, getApplicationPid } from '../android/adb';
import { runSimulatorLoggingProcess } from '../ios/simulator';
import { EventEmitter } from 'events';
import { Entry } from '../types';
import {
  ANDROID_PARSED_LOG_FIXTURES,
  ANDROID_RAW_LOG_FIXTURES,
} from './__fixtures__/android';
import {
  IOS_PARSED_LOG_FIXTURES,
  IOS_RAW_LOG_FIXTURES,
} from './__fixtures__/ios';

jest.mock('../android/adb.ts', () => ({
  runAndroidLoggingProcess: jest.fn(),
  getApplicationPid: jest.fn(),
}));

jest.mock('../ios/simulator.ts', () => ({
  runSimulatorLoggingProcess: jest.fn(),
}));

describe('Node API', () => {
  describe('for Android', () => {
    describe('should spawn logcat process and emit entries', () => {
      it('when no filter is used', (done: Function) => {
        let entriesEmitted = 0;
        const loggingEmitter = new EventEmitter();
        (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
          stdout: loggingEmitter,
          stderr: new EventEmitter(),
        }));

        const emitter = logkitty({
          platform: 'android',
          priority: AndroidPriority.INFO,
        });

        emitter.on('entry', (entry: Entry) => {
          switch (entriesEmitted) {
            case 0:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[0]);
              break;
            case 1:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[1]);
              break;
            case 2:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[2]);
              break;
            default:
              throw new Error('should never get here');
          }

          entriesEmitted += 1;
        });

        ANDROID_RAW_LOG_FIXTURES.forEach((data: string) => {
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
        (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
          stdout: loggingEmitter,
          stderr: new EventEmitter(),
        }));
        (getApplicationPid as jest.Mock).mockImplementationOnce(
          (appId: string) => {
            return appId === 'com.example.app'
              ? ANDROID_PARSED_LOG_FIXTURES[1].pid
              : -1;
          }
        );

        const emitter = logkitty({
          platform: 'android',
          priority: AndroidPriority.INFO,
          filter: makeAppFilter('com.example.app'),
        });

        emitter.on('entry', (entry: Entry) => {
          expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[1]);
          entriesEmitted += 1;
        });

        ANDROID_RAW_LOG_FIXTURES.forEach((data: string) => {
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
        (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
          stdout: loggingEmitter,
          stderr: new EventEmitter(),
        }));

        const emitter = logkitty({
          platform: 'android',
          priority: AndroidPriority.VERBOSE,
          filter: makeTagsFilter('wificond', 'storaged'),
        });

        emitter.on('entry', (entry: Entry) => {
          switch (entriesEmitted) {
            case 0:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[0]);
              break;
            case 1:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[2]);
              break;
            case 2:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[3]);
              break;
            default:
              throw new Error('should never get here');
          }

          entriesEmitted += 1;
        });

        ANDROID_RAW_LOG_FIXTURES.forEach((data: string) => {
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
        (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
          stdout: loggingEmitter,
          stderr: new EventEmitter(),
        }));

        const emitter = logkitty({
          platform: 'android',
          priority: AndroidPriority.VERBOSE,
          filter: makeMatchFilter(/scan/),
        });

        emitter.on('entry', (entry: Entry) => {
          switch (entriesEmitted) {
            case 0:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[2]);
              break;
            case 1:
              expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[3]);
              break;
            default:
              throw new Error('should never get here');
          }

          entriesEmitted += 1;
        });

        ANDROID_RAW_LOG_FIXTURES.forEach((data: string) => {
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
        (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
          stdout: loggingEmitter,
          stderr: new EventEmitter(),
        }));

        const emitter = logkitty({
          platform: 'android',
          priority: AndroidPriority.VERBOSE,
          filter: makeCustomFilter('*:S', 'storaged:I'),
        });

        emitter.on('entry', (entry: Entry) => {
          expect(entry).toEqual(ANDROID_PARSED_LOG_FIXTURES[0]);
          entriesEmitted += 1;
        });

        ANDROID_RAW_LOG_FIXTURES.forEach((data: string) => {
          loggingEmitter.emit('data', data);
        });

        setTimeout(() => {
          expect(entriesEmitted).toBe(1);
          done();
        });
      });
    });
  });

  describe('for iOS', () => {
    describe('should spawn logging process and emit entires', () => {
      it('when no filter is used', (done: Function) => {
        let entriesEmitted = 0;
        const loggingEmitter = new EventEmitter();
        (runSimulatorLoggingProcess as jest.Mock).mockImplementationOnce(
          () => ({
            stdout: loggingEmitter,
            stderr: new EventEmitter(),
          })
        );

        const emitter = logkitty({
          platform: 'ios',
        });

        emitter.on('entry', (entry: Entry) => {
          expect(entry).toEqual(IOS_PARSED_LOG_FIXTURES[entriesEmitted]);
          entriesEmitted += 1;
        });

        IOS_RAW_LOG_FIXTURES.forEach((data: string) => {
          loggingEmitter.emit('data', data);
        });

        setTimeout(() => {
          expect(entriesEmitted).toBe(6);
          done();
        });
      });

      it('when tag filter is used', (done: Function) => {
        let entriesEmitted = 0;
        const loggingEmitter = new EventEmitter();
        (runSimulatorLoggingProcess as jest.Mock).mockImplementationOnce(
          () => ({
            stdout: loggingEmitter,
            stderr: new EventEmitter(),
          })
        );

        const emitter = logkitty({
          platform: 'ios',
          filter: makeTagsFilter('testApp1'),
        });

        emitter.on('entry', (entry: Entry) => {
          expect(entry).toEqual(IOS_PARSED_LOG_FIXTURES[5]);
          entriesEmitted += 1;
        });

        IOS_RAW_LOG_FIXTURES.forEach((data: string) => {
          loggingEmitter.emit('data', data);
        });

        setTimeout(() => {
          expect(entriesEmitted).toBe(1);
          done();
        }, 0);
      });

      it('when match filter used', (done: Function) => {
        let entriesEmitted = 0;
        const loggingEmitter = new EventEmitter();
        (runSimulatorLoggingProcess as jest.Mock).mockImplementationOnce(
          () => ({
            stdout: loggingEmitter,
            stderr: new EventEmitter(),
          })
        );

        const emitter = logkitty({
          platform: 'ios',
          filter: makeMatchFilter(/test\s/),
        });

        emitter.on('entry', (entry: Entry) => {
          expect(entry).toEqual(IOS_PARSED_LOG_FIXTURES[2]);
          entriesEmitted += 1;
        });

        IOS_RAW_LOG_FIXTURES.forEach((data: string) => {
          loggingEmitter.emit('data', data);
        });

        setTimeout(() => {
          expect(entriesEmitted).toBe(1);
          done();
        }, 0);
      });
    });

    it('makeAppFilter should throw error', () => {
      expect(() => {
        logkitty({
          platform: 'ios',
          filter: makeAppFilter('com.example.app'),
        });
      }).toThrow('App filter is only available for Android');
    });

    it('makeCustomFilter should throw error', () => {
      expect(() => {
        logkitty({
          platform: 'ios',
          filter: makeCustomFilter(''),
        });
      }).toThrow('Custom filter is only available for Android');
    });
  });

  it('should emit error when parsing fails', (done: Function) => {
    const loggingEmitter = new EventEmitter();
    (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
      stdout: loggingEmitter,
      stderr: new EventEmitter(),
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
    (runAndroidLoggingProcess as jest.Mock).mockImplementationOnce(() => ({
      stdout: loggingEmitter,
      stderr: new EventEmitter(),
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

  it('should emit error when platform is not supported', () => {
    expect(() => {
      logkitty({
        platform: 'windows' as any,
      });
    }).toThrow('Platform windows is not supported');
  });
});
