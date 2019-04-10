export function getMinPriority(
  Priority: { fromName: (key: any) => number },
  priorities: { [key: string]: boolean },
  defaultPriority: number
): number {
  const parsedPriorities = Object.keys(priorities)
    .filter((key: string) => priorities[key])
    .map((key: string) => {
      return Priority.fromName(key);
    });
  return parsedPriorities.length
    ? Math.min(...parsedPriorities)
    : defaultPriority;
}
