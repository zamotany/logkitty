export type Platform = 'ios' | 'android';

export type Entry = {
  date: Date;
  pid: number;
  priority: number;
  tag?: string;
  appId?: string;
  messages: string[];
  platform: Platform;
};

export interface IParser {
  splitMessages(data: string): string[];
  parseMessages(messages: string[]): Entry[];
}

export interface IFilter {
  shouldInclude(entry: Entry): boolean;
}
