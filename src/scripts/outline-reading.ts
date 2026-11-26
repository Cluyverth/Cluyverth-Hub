function headingAt(readingLine: number, headingCount: number, topAt: (index: number) => number): number {
  let next = 0;
  while (next < headingCount && topAt(next) <= readingLine) next++;
  return next - 1;
}

export function createOutlineReading(headingCount: number, topAt: (index: number) => number) {
  let fragment = -1;
  let landingOffset: number | undefined;

  function navigateTo(index: number): void {
    fragment = index;
    landingOffset = undefined;
  }

  function currentAt(scrollTop: number, readingLine: number, atBottom: boolean): number {
    if (fragment >= 0 && (landingOffset === undefined || landingOffset === scrollTop)) {
      landingOffset = scrollTop;
      return fragment;
    }
    fragment = -1;

    return atBottom ? headingCount - 1 : headingAt(readingLine, headingCount, topAt);
  }

  return { navigateTo, currentAt };
}
