import { ChildProcess } from 'child_process';

export type Entry = {
  date: Date;
  pid: number;
  priority: number;
  tag: string;
  message: string;
};

export interface IParser {
  splitMessages(data: string): string[];
  parseMessages(messages: string[]): Entry[];
}

export interface IFilter {
  shouldInclude(entry: Entry): boolean;
}
