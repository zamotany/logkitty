import { IFilter, Entry } from '../types';
import { getApplicationPid } from './adb';

type Filter = (entry: Entry) => boolean;

export class AndroidFilter implements IFilter {
  private readonly minPriority: number;
  private filter: Filter;

  constructor(minPriority: number = 0) {
    this.minPriority = minPriority;
    // Default filter by all
    this.filter = (entry: Entry) => {
      return entry.priority >= this.minPriority;
    };
  }

  setFilterByTag(tags: string[]) {
    this.filter = (entry: Entry) => {
      return entry.priority >= this.minPriority && tags.indexOf(entry.tag) > -1;
    };
  }

  setFilterByApp(applicationId: string, adbPath?: string) {
    const pid = getApplicationPid(applicationId, adbPath);
    this.filter = (entry: Entry) => {
      return entry.priority >= this.minPriority && entry.pid === pid;
    };
  }

  setFilterByMatch(regexes: RegExp[]) {
    this.filter = (entry: Entry) => {
      return (
        entry.priority >= this.minPriority &&
        Boolean(regexes.find((reg: RegExp) => reg.test(entry.message)))
      );
    };
  }

  setCustomFilter(filterSpecs: string[]) {
    throw new Error('TODO');
  }

  shouldInclude(entry: Entry) {
    return this.filter(entry);
  }
}
