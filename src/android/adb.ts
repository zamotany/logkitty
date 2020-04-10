import { spawn, execFileSync, ChildProcess } from 'child_process';
import path from 'path';
import {
  CodeError,
  ERR_ANDROID_UNPROCESSABLE_PID,
  ERR_ANDROID_CANNOT_GET_APP_PID,
  ERR_ANDROID_CANNOT_CLEAN_LOGCAT_BUFFER,
  ERR_ANDROID_CANNOT_START_LOGCAT,
} from '../errors';

export function runAndroidLoggingProcess(adbPath?: string): ChildProcess {
  const execPath = getAdbPath(adbPath);
  return spawnLogcatProcess(execPath);
}

export function getSdkRoot(): string | undefined {
  return process.env.ANDROID_SDK_ROOT ?? process.env.ANDROID_HOME;
}

export function getAdbPath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }
  const sdkRoot = getSdkRoot();
  return sdkRoot ? `${sdkRoot}/platform-tools/adb` : 'adb';
}

export function spawnLogcatProcess(adbPath: string): ChildProcess {
  try {
    execFileSync(adbPath, ['logcat', '-c']);
  } catch (error) {
    throw new CodeError(
      ERR_ANDROID_CANNOT_CLEAN_LOGCAT_BUFFER,
      (error as Error).message
    );
  }

  try {
    return spawn(adbPath, ['logcat', '-v', 'time', 'process', 'tag'], {
      stdio: 'pipe',
    });
  } catch (error) {
    throw new CodeError(
      ERR_ANDROID_CANNOT_START_LOGCAT,
      (error as Error).message
    );
  }
}

export function getApplicationPid(
  applicationId: string,
  adbPath?: string
): number {
  let output: Buffer | String | undefined;
  try {
    output = execFileSync(getAdbPath(adbPath), [
      'shell',
      'pidof',
      '-s',
      applicationId,
    ]);
  } catch (error) {
    throw new CodeError(
      ERR_ANDROID_CANNOT_GET_APP_PID,
      (error as Error).message
    );
  }

  const pid = output ? parseInt(output.toString(), 10) : NaN;
  if (isNaN(pid)) {
    throw new CodeError(ERR_ANDROID_UNPROCESSABLE_PID);
  }

  return pid;
}
