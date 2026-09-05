import { useState, useEffect, useCallback } from 'react';
import scheduleData from '../../bible_reading_plan_chien_thang.json';

export function useSchedule() {
  const [schedule] = useState(scheduleData);
  const [loading] = useState(false);

  const getDayData = useCallback((dayIndex) => {
    return schedule.find(d => d.dayIndex === dayIndex) || schedule[0];
  }, [schedule]);

  return { schedule, loading, getDayData };
}
