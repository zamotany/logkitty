import {
  container,
  color,
  modifier,
  pad,
  AnsiColor,
  AnsiModifier,
  ifElse,
} from 'ansi-fragments';
import { CodeError } from './errors';
import { Priority as AndroidPriority } from './android/constants';
import { Priority as IosPriority } from './ios/constants';
import { Entry } from './types';

export function formatError(error: CodeError | Error): string {
  return container(
    color('red', '✖︎ Ups, something went wrong'),
    pad(2, '\n'),
    color('red', modifier('bold', 'CODE'), ' ▶︎ '),
    'code' in error ? error.code : 'ERR_UNKNOWN',
    pad(1, '\n'),
    color('red', modifier('bold', 'MESSAGE'), ' ▶︎ '),
    error.message
  ).build();
}

export function formatEntry(entry: Entry): string {
  let priorityColor: AnsiColor = 'none';
  let priorityModifier: AnsiModifier = 'none';

  if (
    (entry.platform === 'android' && entry.priority >= AndroidPriority.ERROR) ||
    (entry.platform === 'ios' && entry.priority >= IosPriority.ERROR)
  ) {
    priorityColor = 'red';
  } else if (
    entry.platform === 'android' &&
    entry.priority === AndroidPriority.WARN
  ) {
    priorityColor = 'yellow';
  } else if (
    (entry.platform === 'android' &&
      entry.priority === AndroidPriority.VERBOSE) ||
    (entry.platform === 'ios' && entry.priority === IosPriority.DEBUG)
  ) {
    priorityModifier = 'dim';
  }

  const output = container(
    modifier('dim', `[${entry.date.format('HH:mm:ss')}]`),
    pad(1),
    color(
      priorityColor,
      modifier(
        priorityModifier,
        `${
          entry.platform === 'android'
            ? AndroidPriority.toLetter(entry.priority)
            : IosPriority.toLetter(entry.priority)
        } |`
      )
    ),
    pad(1),
    modifier(
      'bold',
      color(
        priorityColor,
        modifier(priorityModifier, entry.tag || entry.appId || '')
      )
    ),
    pad(1),
    color(priorityColor, modifier(priorityModifier, '▶︎')),
    pad(1),
    color(priorityColor, modifier(priorityModifier, entry.messages[0])),
    ifElse(
      entry.messages.length > 1,
      container(
        ...entry.messages
          .slice(1)
          .map((line: string, index: number, arr: string[]) =>
            container(
              pad(1, '\n'),
              pad((entry.tag || entry.appId || '').length + 16),
              color(
                priorityColor,
                modifier(
                  priorityColor === 'none' ? 'dim' : 'none',
                  `${index === arr.length - 1 ? '└' : '│'} `
                )
              ),
              color(priorityColor, modifier(priorityModifier, line))
            )
          )
      ),
      ''
    )
  ).build();

  return `${output}\n`;
}
