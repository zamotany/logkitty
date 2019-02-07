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

export const Priority = {
  ...codes,
  fromName(name: keyof typeof codes): number {
    const value = codes[name];
    return value ? value : 0;
  },
  toName(code: number): keyof typeof codes {
    return (
      (Object.keys(codes) as Array<keyof typeof codes>).find(
        (key: keyof typeof codes) => codes[key] === code
      ) || 'UNKNOWN'
    );
  },
  fromLetter(letter: string): number {
    return codes[
      (Object.keys(codes) as Array<keyof typeof codes>).find(
        (key: keyof typeof codes) => key[0] === letter.toUpperCase()
      ) || 'UNKNOWN'
    ];
  },
  toLetter(code: number): string {
    return Priority.toName(code)[0];
  },
};
