// utils/getDateRange.ts
export function getDateRange(from?: string, to?: string) {
    const offset = 3 * 60 * 60 * 1000;
  
    const fromDate = from
      ? new Date(new Date(from + 'T00:00:00').getTime() + offset)
      : undefined;
  
    const toDate = to
      ? new Date(new Date(to + 'T23:59:59').getTime() + offset)
      : undefined;
  
    return { fromDate, toDate };
  }
  