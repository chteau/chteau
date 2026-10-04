/** Formats an ISO date as "10 dec 2021" — day, lowercase short month, year. */
export function formatReadableDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
}
