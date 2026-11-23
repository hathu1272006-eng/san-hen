export function currentTime(now?: Date): { date: string; hour: string };
export function bookableDays(now?: Date): string[];
export function isUpcoming(date: string, hour: string, now?: Date): boolean;
