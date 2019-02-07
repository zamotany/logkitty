const codes = {
  UNKNOWN: 0,
  DEFAULT: 1,
  VERBOSE: 2,
  DEBUG: 3,
  INFO: 4,
  WARN: 5,
  ERROR: 6,
  FATAL: 7,
  SILENT: 8,
};

export type PriorityNames = keyof typeof codes;

export const Priority = {
  ...codes,
  fromName(name: PriorityNames): number {
    const value = codes[name];
    return value ? value : 0;
  },
  toName(code: number): PriorityNames {
    return (
      (Object.keys(codes) as PriorityNames[]).find(
        (key: PriorityNames) => codes[key] === code
      ) || 'UNKNOWN'
    );
  },
  fromLetter(letter: string): number {
    return codes[
      (Object.keys(codes) as PriorityNames[]).find(
        (key: PriorityNames) => key[0] === letter.toUpperCase()
      ) || 'UNKNOWN'
    ];
  },
  toLetter(code: number): string {
    return Priority.toName(code)[0];
  },
};
