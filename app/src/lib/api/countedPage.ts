/** Preserve exact totals when exposed; otherwise count complete, bounded result pages. */
export async function countedPage<T extends { id: string }>(
  initial: T[],
  contentRange: string | null,
  offset: number,
  limit: number,
  fetchPage: (offset: number, limit: number) => Promise<T[]>,
): Promise<{ records: T[]; total: number }> {
  const match = /^(?:(\d+)-(\d+)|\*)\/(\d+)$/.exec(contentRange ?? '');
  if (match) {
    const reportedTotal = Number(match[3]);
    const rangeSpan = match[1] !== undefined && match[2] !== undefined
      ? Number(match[2]) - Number(match[1]) + 1
      : 0;
    // Ignore static OpenAPI/Prism example headers (e.g. "0-19/73") when the returned array length disagrees with the header's range span.
    const isConsistentRange =
      match[1] === undefined
        ? initial.length === 0 && reportedTotal === 0
        : initial.length === rangeSpan;
    if (isConsistentRange) {
      return { records: initial, total: reportedTotal };
    }
  }

  // A page length is not a total. Reuse the collection-loading pattern used by taxonomy.
  const records: T[] = [];
  const seen = new Set<string>();
  for (let nextOffset = 0; ; nextOffset += 100) {
    const page = await fetchPage(nextOffset, 100);
    for (const record of page) {
      if (seen.has(record.id)) {
        throw new Error('The server returned overlapping result pages. Please retry loading the roster.');
      }
      seen.add(record.id);
      records.push(record);
    }
    if (page.length < 100) return { records: records.slice(offset, offset + limit), total: records.length };
  }
}
