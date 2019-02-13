const codes = {
  UNKNOWN: 0,
  VERBOSE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
  FATAL: 6,
  SILENT: 7,
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
