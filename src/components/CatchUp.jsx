import { CheckCircle2 } from 'lucide-react';
import { Card, Badge, EmptyState } from './ui/Primitives.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function CatchUp({ schedule, progress, isDayMissed, onMarkReading, currentDayIndex }) {
  const theme = useTheme();
  const isLight = theme === 'light';

  const missedDays = schedule ? schedule.filter(d => isDayMissed(d.dayIndex)) : [];

  const t = {
    h2: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-600' : 'text-slate-400',
    headerBorder: isLight ? 'border-slate-200' : 'border-[#23372d]',
    dayNumBg: isLight ? 'bg-slate-100 text-slate-700 font-bold' : 'bg-[#112019] text-slate-300 font-bold',
    dayNumBgPartial: isLight ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-amber-950 text-amber-300 font-bold border border-amber-800',
    dayTitle: isLight ? 'text-slate-900 font-semibold' : 'text-slate-100 font-semibold',
    dayMeta: isLight ? 'text-slate-500' : 'text-slate-400',
    countText: isLight ? 'text-slate-600' : 'text-slate-400',
    readingText: isLight ? 'text-slate-900' : 'text-slate-200',
    readingChecked: isLight ? 'line-through text-slate-400' : 'line-through text-slate-500',
  };

  if (missedDays.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          icon="🎉"
          title="Không có ngày nào bị bỏ lỡ!"
          description="Bạn đang theo kịp kế hoạch rất tốt. Tiếp tục duy trì nhé!"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="animate-fade-in-up">
        <h2 className={`text-2xl ${t.h2}`}>Đọc Bù 📖</h2>
        <p className={`text-sm mt-1 ${t.sub}`}>Không có tội lỗi — hãy bắt đầu từ nơi bạn có thể.</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="warning">{missedDays.length} ngày chưa hoàn thành</Badge>
        </div>
      </div>

      <div className="space-y-3">
        {missedDays.map((dayData, idx) => {
          const p = progress[dayData.dayIndex] || {};
          const completedCount = [p.psalmsProverbs, p.newTestament, p.oldTestament].filter(Boolean).length;
          const isPartial = completedCount > 0 && completedCount < 3;

          return (
            <div key={dayData.dayIndex} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.03}s` }}>
              <Card className="overflow-hidden">
                <div className={`flex items-center justify-between p-4 border-b ${t.headerBorder}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isPartial ? t.dayNumBgPartial : t.dayNumBg
                    }`}>
                      {dayData.dayIndex}
                    </div>
                    <div>
                      <p className={`text-sm ${t.dayTitle}`}>Ngày {dayData.dayIndex}</p>
                      <p className={`text-xs ${t.dayMeta}`}>Tháng {dayData.month}, ngày {dayData.dayOfMonth}</p>
                    </div>
                  </div>
                  <span className={`text-xs ${t.countText}`}>{completedCount}/3 hoàn thành</span>
                </div>

                <div className="p-4 space-y-3">
                  {[
                    { key: 'psalmsProverbs', icon: '🎵', text: dayData.readings.psalmsProverbs },
                    { key: 'newTestament', icon: '✝️', text: dayData.readings.newTestament },
                    { key: 'oldTestament', icon: '📜', text: dayData.readings.oldTestament },
                  ].map(({ key, icon, text }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        id={`catchup-${dayData.dayIndex}-${key}`}
                        type="checkbox"
                        className="reading-checkbox"
                        checked={p[key] || false}
                        onChange={e => onMarkReading(dayData.dayIndex, key, e.target.checked)}
                      />
                      <span className="text-lg">{icon}</span>
                      <span className={`text-sm transition-all ${p[key] ? t.readingChecked : t.readingText}`}>
                        {text}
                      </span>
                      {p[key] && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />}
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
