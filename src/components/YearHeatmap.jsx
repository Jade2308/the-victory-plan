import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Card } from './ui/Primitives.jsx';

const MONTHS_VI = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function YearHeatmap({ progress, startDate, currentDayIndex, isDayComplete, isDayMissed }) {
  const theme = useTheme();
  const isLight = theme === 'light';

  // Build 365-day grid in 12-month columns
  const months = useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date();
    const result = Array.from({ length: 12 }, (_, m) => ({ month: m + 1, days: [] }));

    for (let i = 1; i <= 365; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i - 1);
      const m = d.getMonth(); // 0-indexed
      result[m].days.push({ dayIndex: i, date: d });
    }
    return result;
  }, [startDate]);

  const getCellColor = (dayIndex) => {
    if (dayIndex > currentDayIndex) {
      return isLight ? 'bg-slate-200' : 'bg-slate-800/80';
    }
    if (isDayComplete(dayIndex)) {
      return 'bg-emerald-500';
    }
    if (isDayMissed(dayIndex)) {
      return isLight ? 'bg-red-400' : 'bg-red-500/70';
    }
    return 'bg-indigo-500'; // today / in progress
  };

  const totalComplete = Object.keys(progress).filter(k => isDayComplete(parseInt(k))).length;
  const totalMissed = Array.from({ length: currentDayIndex - 1 }, (_, i) => i + 1)
    .filter(d => isDayMissed(d)).length;

  const t = {
    h2: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-600' : 'text-slate-400',
    monthLabel: isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="animate-fade-in-up">
        <h2 className={`text-2xl ${t.h2}`}>Hành Trình 365 Ngày 🗓️</h2>
        <p className={`text-sm mt-1 ${t.sub}`}>Tổng quan tiến độ 365 ngày</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
        {[
          { val: totalComplete, label: 'Hoàn thành', color: 'text-emerald-600 dark:text-emerald-400' },
          { val: totalMissed, label: 'Bỏ lỡ', color: 'text-red-600 dark:text-red-400' },
          { val: 365 - currentDayIndex, label: 'Còn lại', color: 'text-indigo-600 dark:text-indigo-400' },
        ].map(({ val, label, color }) => (
          <Card key={label} className="p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{val}</div>
            <div className={`text-xs mt-0.5 ${t.sub}`}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Heatmap grid */}
      <Card className="p-4 animate-fade-in-up">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-4">
          {months.map(({ month, days }) => (
            <div key={month}>
              <p className={`text-[10px] mb-1.5 ${t.monthLabel}`}>{MONTHS_VI[month - 1]}</p>
              <div className="grid grid-cols-4 gap-[3px]">
                {days.map(({ dayIndex }) => (
                  <div
                    key={dayIndex}
                    title={`Ngày ${dayIndex}`}
                    className={`w-4 h-4 rounded-[3px] transition-colors ${getCellColor(dayIndex)}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 flex-wrap pt-3 border-t border-slate-200 dark:border-slate-800">
          {[
            { color: 'bg-emerald-500', label: 'Hoàn thành' },
            { color: isLight ? 'bg-red-400' : 'bg-red-500/70', label: 'Bỏ lỡ' },
            { color: 'bg-indigo-500', label: 'Hôm nay' },
            { color: isLight ? 'bg-slate-200' : 'bg-slate-800/80', label: 'Tương lai' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-[3px] ${color}`} />
              <span className={`text-[11px] ${t.sub}`}>{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
