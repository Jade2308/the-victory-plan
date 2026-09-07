import { useMemo } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from './ui/Primitives.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function WeeklySummary({ progress, isDayComplete, isDayMissed, currentDayIndex, startDate }) {
  const theme = useTheme();
  const isLight = theme === 'light';

  // Calculate current week (7 days) centered around currentDayIndex
  const weekDays = useMemo(() => {
    const currentWeekNum = Math.ceil(currentDayIndex / 7);
    const startDay = (currentWeekNum - 1) * 7 + 1;
    const days = [];
    const start = startDate ? new Date(startDate) : new Date();

    for (let i = 0; i < 7; i++) {
      const dayIndex = startDay + i;
      if (dayIndex > 365) break;

      const date = new Date(start);
      date.setDate(start.getDate() + dayIndex - 1);
      const dayOfWeek = DAY_NAMES[date.getDay()];

      days.push({
        dayIndex,
        date,
        dayOfWeek,
        isCompleted: isDayComplete(dayIndex),
        isMissed: isDayMissed(dayIndex),
        isToday: dayIndex === currentDayIndex,
        isFuture: dayIndex > currentDayIndex,
      });
    }
    return { weekNum: currentWeekNum, days };
  }, [currentDayIndex, isDayComplete, isDayMissed, startDate]);

  const completedCount = weekDays.days.filter(d => d.isCompleted).length;

  const t = {
    h2: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-600' : 'text-slate-400',
    card: isLight ? 'bg-white border-slate-200' : 'bg-[#0b1410] border-[#23372d]',
    dayName: isLight ? 'text-slate-500' : 'text-slate-400',
    dayNum: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    todayRing: isLight ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : 'ring-2 ring-emerald-500 bg-[#112019]/40',
    completeBg: isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-[#112019] text-emerald-400 border border-[#2c4337]',
    missedBg: isLight ? 'bg-red-100 text-red-700' : 'bg-red-950 text-red-400 border border-red-800',
    futureBg: isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#112019] text-slate-600',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="animate-fade-in-up">
        <h2 className={`text-2xl ${t.h2}`}>Tuần Này 📊</h2>
        <p className={`text-sm mt-1 ${t.sub}`}>Thống kê tiến độ Tuần {weekDays.weekNum}</p>
      </div>

      {/* Week grid */}
      <Card className="p-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            Tuần {weekDays.weekNum}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-[#112019] text-emerald-300 border border-[#2c4337]'
          }`}>
            {completedCount}/7 ngày hoàn thành
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.days.map(({ dayIndex, dayOfWeek, isCompleted, isMissed, isToday, isFuture }) => (
            <div
              key={dayIndex}
              className={`flex flex-col items-center p-2.5 rounded-xl text-center transition-all ${
                isToday ? t.todayRing : ''
              } ${
                isCompleted ? t.completeBg : isMissed ? t.missedBg : t.futureBg
              }`}>
              <span className={`text-[10px] font-semibold mb-1 ${t.dayName}`}>{dayOfWeek}</span>
              <span className={`text-xs ${t.dayNum}`}>{dayIndex}</span>
              <div className="mt-1.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isMissed ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
