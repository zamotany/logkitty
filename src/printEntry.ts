import { Entry, Priority } from 'adbkit-logcat';
import {
  container,
  color,
  modifier,
  pad,
  AnsiColor,
  AnsiModifier,
} from 'ansi-fragments';

export default function printEntry(entry: Entry) {
  let priorityColor: AnsiColor = 'white';
  let priorityModifier: AnsiModifier | undefined;
  let shouldColorizeMessage = false;

  if (entry.priority === Priority.FATAL || entry.priority === Priority.ERROR) {
    priorityColor = 'red';
    shouldColorizeMessage = true;
  } else if (entry.priority === Priority.WARN) {
    priorityColor = 'yellow';
    shouldColorizeMessage = true;
  } else if (entry.priority === Priority.VERBOSE) {
    priorityModifier = 'dim';
  }

  const priorityInfo = `${Priority.toLetter(entry.priority)} |`;
  const separator = '▶︎';
  const message = shouldColorizeMessage
    ? color(priorityColor, entry.message)
    : entry.message;
  const output = container(
    modifier('dim', parseDate(entry.date)),
    pad(1),
    color(
      priorityColor,
      priorityModifier ? modifier(priorityModifier, priorityInfo) : priorityInfo
    ),
    pad(1),
    modifier(
      'bold',
      color(
        priorityColor,
        priorityModifier ? modifier(priorityModifier, entry.tag) : entry.tag
      )
    ),
    pad(1),
    color(
      priorityColor,
      priorityModifier ? modifier('dim', separator) : separator
    ),
    pad(1),
    priorityModifier ? modifier('dim', message) : message
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
