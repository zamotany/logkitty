import { ChildProcess, spawn } from 'child_process';
import { CodeError, ERR_IOS_CANNOT_START_SYSLOG } from '../errors';

export function runSimulatorLoggingProcess(): ChildProcess {
  try {
    return spawn(
      'xcrun',
      ['simctl', 'spawn', 'booted', 'log', 'stream', '--type', 'log'],
      {
        stdio: 'pipe',
      }
    );
  } catch (error) {
    throw new CodeError(ERR_IOS_CANNOT_START_SYSLOG, (error as Error).message);
  }
}
