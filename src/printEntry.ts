import { Entry, Priority } from 'adbkit-logcat';
import { container, color, modifier, pad, AnsiColor } from 'ansi-fragments';

export default function printEntry(entry: Entry) {
  let priorityColor: AnsiColor = 'white';
  let shouldColorizeMessage = false;
  if (entry.priority === Priority.FATAL || entry.priority === Priority.ERROR) {
    priorityColor = 'red';
    shouldColorizeMessage = true;
  } else if (entry.priority === Priority.WARN) {
    priorityColor = 'yellow';
    shouldColorizeMessage = true;
  } else if (entry.priority === Priority.VERBOSE) {
    priorityColor = 'gray';
  }
  const output = container(
    color('gray', parseDate(entry.date)),
    pad(1),
    color(priorityColor, `${Priority.toLetter(entry.priority)} |`),
    pad(1),
    modifier('bold', color(priorityColor, entry.tag)),
    pad(1),
    color(priorityColor, '▶︎'),
    pad(1),
    shouldColorizeMessage ? color(priorityColor, entry.message) : entry.message
  ).build();
  process.stdout.write(`${output}\n`);
}

function parseDate(value: Date): string {
  const hour =
    value.getUTCHours() < 10
      ? `0${value.getUTCHours()}`
      : value.getUTCHours().toString();
  const minutes =
    value.getUTCMinutes() < 10
      ? `0${value.getUTCMinutes()}`
      : value.getUTCMinutes().toString();
  const seconds =
    value.getUTCSeconds() < 10
      ? `0${value.getUTCSeconds()}`
      : value.getUTCSeconds().toString();
  return `[${hour}:${minutes}:${seconds}]`;
}