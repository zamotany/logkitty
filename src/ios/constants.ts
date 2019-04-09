const codes = {
  DEBUG: 0,
  DEFAULT: 1,
  INFO: 2,
  ERROR: 3,
};

export type PriorityNames = keyof typeof codes;

export const Priority = {
  ...codes,
  fromName(name: PriorityNames): number {
    const value = codes[name.toUpperCase() as PriorityNames];
    return value ? value : 0;
  },
  toName(code: number): PriorityNames {
    return (
      (Object.keys(codes) as PriorityNames[]).find(
        (key: PriorityNames) => codes[key] === code
      ) || 'DEFAULT'
    );
  },
  fromLetter(letter: string): number {
    return codes[
      (Object.keys(codes) as PriorityNames[]).find(
        (key: PriorityNames) => key[0] === letter.toUpperCase()
      ) || 'DEFAULT'
    ];
  },
  toLetter(code: number): string {
    return Priority.toName(code)[0];
  },
};
