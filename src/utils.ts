import { Priority } from 'adbkit-logcat';

export function getMinPriority(
  priorities: { [key: string]: boolean },
  defaultPriority: number = Priority.DEBUG
): number {
  const parsedPriorities = Object.keys(priorities)
    .filter((key: string) => priorities[key])
    .map((key: string) => {
      return Priority.fromLetter(key === 'U' ? '?' : key) || Priority.SILENT;
    });

  return parsedPriorities.length
    ? Math.min(...parsedPriorities)
    : defaultPriority;
}
