import { IFilter, Entry } from '../types';

type Filter = (entry: Entry) => boolean;

export default class IosFilter implements IFilter {
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
      return Boolean(
        entry.priority >= this.minPriority &&
          entry.tag &&
          tags.indexOf(entry.tag) > -1
      );
    };
  }

  setFilterByMatch(regexes: RegExp[]) {
    this.filter = (entry: Entry) => {
      return (
        entry.priority >= this.minPriority &&
        Boolean(
          regexes.find((reg: RegExp) =>
            Boolean(entry.messages.find((message: string) => reg.test(message)))
          )
        )
      );
    };
  }

  shouldInclude(entry: Entry) {
    return this.filter(entry);
  }
}
