import { Entry, Priority } from 'adbkit-logcat';
import printEntry from './printEntry';

export default function processEntry(
  command: string,
  {
    priorities,
    tags,
    pid,
  }: {
    priorities: { [key: string]: boolean };
    tags: string[];
    pid: number;
  }
) {
  return (entry: Entry) => {
    if (
      (command === 'all' && satisfiesPriority(entry, priorities)) ||
      command === 'custom' ||
      (command === 'tag' &&
        tags.indexOf(entry.tag) > -1 &&
        satisfiesPriority(entry, priorities)) ||
      (command === 'app' &&
        entry.pid === pid &&
        satisfiesPriority(entry, priorities))
    ) {
      printEntry(entry);
    }
  };
}

function satisfiesPriority(
  entry: Entry,
  priorities: { [key: string]: boolean }
): boolean {
  const parsedPriorities = Object.keys(priorities)
    .filter((key: string) => priorities[key])
    .map((key: string) => {
      return Priority.fromLetter(key === 'U' ? '?' : key) || Priority.SILENT;
    });
  const lowestPriority = parsedPriorities.length
    ? Math.min(...parsedPriorities)
    : Priority.DEBUG;

  return entry.priority >= lowestPriority;
}
