export class CodeError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message);
    this.code = code;
  }
}

export const ERR_UNPROCESSABLE_PID = 'ERR_UNPROCESSABLE_PID';
export const ERR_CANNOT_GET_APP_PID = 'ERR_CANNOT_GET_APP_PID';
export const ERR_CANNOT_CLEAN_LOGCAT_BUFFER = 'ERR_CANNOT_CLEAN_LOGCAT_BUFFER';
export const ERR_CANNOT_START_LOGCAT = 'ERR_CANNOT_START_LOGCAT';
