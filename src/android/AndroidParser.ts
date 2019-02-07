import assert from 'assert';
import { IParser, Entry } from '../types';
import { Priority } from './constants';

export default class AndroidParser implements IParser {
  static timeRegex: RegExp = /\d{2}-\d{2} (\d{2}):(\d{2}):(\d{2}).\d{3}/m;
  static headerRegex: RegExp = /^\s*(\w)\/(.+)\(([\s\d]+)\):/;

  splitMessages(raw: string): string[] {
    const messages: string[] = [];
    let data = raw.toString();
    let match = data.match(AndroidParser.timeRegex);
    while (match) {
      const timeHeader = match[0];
      data = data.slice((match.index || 0) + timeHeader.length);
      const nextMatch = data.match(AndroidParser.timeRegex);
      const body = nextMatch ? data.slice(0, nextMatch.index) : data;
      messages.push(`${timeHeader} ${body}`);
      match = nextMatch;
    }
    return messages;
  }

  parseMessages(messages: string[]): Entry[] {
    return messages.map((rawMessage: string) => {
      const timeMatch = rawMessage.match(AndroidParser.timeRegex);
      if (!timeMatch) {
        throw new Error(`Time regex was not matched in message: ${rawMessage}`);
      }

      const headerMatch = rawMessage
        .slice(timeMatch[0].length)
        .match(AndroidParser.headerRegex) || ['', 'U', 'unknown', '-1'];

      const [, priority, tag, pid] = headerMatch;
      const now = new Date();
      return {
        date: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(timeMatch[1], 10),
          parseInt(timeMatch[2], 10),
          parseInt(timeMatch[3], 10)
        ),
        pid: parseInt(pid.trim(), 10) || 0,
        priority: Priority.fromLetter(priority),
        tag: tag.trim() || 'unknown',
        message: rawMessage
          .slice(timeMatch[0].length + headerMatch[0].length)
          .trim(),
      };
    });
  }
}
