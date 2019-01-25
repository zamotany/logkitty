import logcat, { Priority, Entry } from 'adbkit-logcat';
import { Readable } from 'stream';

export default class LogcatReader {
  private readonly reader: logcat.Reader;
  private entryProcessor: (entry: Entry) => void;

  constructor(inputStream: Readable) {
    this.entryProcessor = this.onEntry; // Default processor
    this.reader = logcat.readStream(inputStream, { fixLineFeeds: true });
    this.reader.on('entry', (entry: Entry) => {
      this.entryProcessor(entry);
    });
  }

  onEntry: (entry: Entry) => void = () => undefined;

  setCustomPatterns(patterns: string[]) {
    patterns.forEach((patter: string) => {
      const [tag, priorityLetter] = patter.split(':');
      const priority = Priority.fromLetter(priorityLetter);
      if (tag === '*' && priority === Priority.SILENT) {
        this.reader.excludeAll();
      } else if (tag === '*' && priority !== Priority.SILENT) {
        this.reader.includeAll(priority);
      } else {
        this.reader.include(tag, priority);
      }
    });
  }

  setFilter(
    filterType: 'tag' | 'app' | 'match' | 'all',
    {
      tags,
      processId,
      regexes,
      minPriority,
    }: {
      tags?: string[];
      processId?: number;
      regexes?: RegExp[];
      minPriority: number;
    }
  ) {
    this.entryProcessor = (entry: Entry) => {
      if (
        entry.priority >= minPriority &&
        (filterType === 'all' ||
          (filterType === 'tag' && tags && tags.indexOf(entry.tag) > -1) ||
          (filterType === 'app' && entry.pid === processId) ||
          (filterType === 'match' &&
            regexes &&
            Boolean(regexes.find((reg: RegExp) => reg.test(entry.message)))))
      ) {
        this.onEntry(entry);
      }
    };
  }
}
