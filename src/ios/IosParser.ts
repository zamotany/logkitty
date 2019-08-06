import DayJS from 'dayjs';
import { IParser, Entry } from '../types';
import { Priority, PriorityNames } from './constants';

export default class IosParser implements IParser {
  static timeRegex: RegExp = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.[\d+]+/m;
  static headerRegex: RegExp = /^\s+[a-z0-9]+\s+(\w+)\s+[a-z0-9]+\s+(\d+)\s+\d+\s+([^:]+):/;

  splitMessages(raw: string): string[] {
    const messages: string[] = [];
    let data = raw.toString();
    let match = data.match(IosParser.timeRegex);
    while (match) {
      const timeMatch = match[0];
      data = data.slice((match.index || 0) + timeMatch.length);
      const nextMatch = data.match(IosParser.timeRegex);
      const body = nextMatch ? data.slice(0, nextMatch.index) : data;
      messages.push(`${timeMatch} ${body}`);
      match = nextMatch;
    }
    return messages;
  }

  parseMessages(messages: string[]): Entry[] {
    return messages
      .map(
        (rawMessage: string): Entry => {
          const timeMatch = rawMessage.match(IosParser.timeRegex);
          if (!timeMatch) {
            throw new Error(
              `Time regex was not matched in message: ${rawMessage}`
            );
          }
          const headerMatch = rawMessage
            .slice(timeMatch[0].length)
            .match(IosParser.headerRegex) || ['', 'Default', '-1', 'unknown'];
          const [, priority, pid, tag] = headerMatch;
          return {
            platform: 'ios',
            date: DayJS(timeMatch[0]).set('millisecond', 0),
            pid: parseInt(pid.trim(), 10) || 0,
            priority: Priority.fromName(priority as PriorityNames),
            tag,
            messages: [
              rawMessage
                .slice(timeMatch[0].length + headerMatch[0].length)
                .trim(),
            ],
          };
        }
      )
      .reduce((acc: Entry[], entry: Entry) => {
        if (
          acc.length > 0 &&
          acc[acc.length - 1].date.isSame(entry.date) &&
          acc[acc.length - 1].appId === entry.appId &&
          acc[acc.length - 1].pid === entry.pid &&
          acc[acc.length - 1].priority === entry.priority
        ) {
          acc[acc.length - 1].messages.push(...entry.messages);
          return acc;
        }
        return [...acc, entry];
      }, []);
  }
}
