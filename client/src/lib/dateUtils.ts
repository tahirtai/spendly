import { useState, useEffect } from 'react';

/**
 * Returns current local date in YYYY-MM-DD format.
 */
export function getTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current local month in YYYY-MM format.
 */
export function getTodayMonthString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Custom React hook that automatically updates current date at midnight (00:00 local time).
 */
export function useAutoDate(): { today: string; currentMonth: string } {
  const [today, setToday] = useState(getTodayDateString());
  const [currentMonth, setCurrentMonth] = useState(getTodayMonthString());

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

      timer = setTimeout(() => {
        const newToday = getTodayDateString();
        setToday(newToday);
        setCurrentMonth(getTodayMonthString());
        scheduleMidnightUpdate();
      }, msUntilMidnight);
    };

    scheduleMidnightUpdate();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { today, currentMonth };
}
