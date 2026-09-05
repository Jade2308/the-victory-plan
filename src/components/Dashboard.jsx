import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles, Plus, Star, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const JOURNAL_PROMPTS = [
  { key: 'believe', emoji: '💡', label: 'Điều tôi tin', sub: 'What I believe / Doctrine' },
  { key: 'stop', emoji: '🛑', label: 'Điều tôi cần dừng lại', sub: 'What I need to stop / Reproof' },
  { key: 'improve', emoji: '⬆️', label: 'Điều tôi cần cải thiện', sub: 'What I need to improve / Correction' },
  { key: 'start', emoji: '🌱', label: 'Điều tôi cần bắt đầu', sub: 'What I need to start / Training' },
];

const MONTHS_VI = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function Dashboard({
  dayData, dayIndex, progress, allProgress = {}, journal, onMarkReading, onSaveJournal, userName,
  onNavigateTab, missedCount, verses = [], onAddVerse, startDate, isDayComplete, isDayMissed
}) {
  const theme = useTheme();
  const isLight = theme === 'light';

  const [journalOpen, setJournalOpen] = useState(false);
  const [heatmapOpen, setHeatmapOpen] = useState(false); // Collapsed by default for a clean, short layout
  const [localJournal, setLocalJournal] = useState(journal || {});

  // Add verse inline state
  const [showAddVerse, setShowAddVerse] = useState(false);
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');

  const handleJournalChange = (key, value) => {
    const updated = { ...localJournal, [key]: value };
    setLocalJournal(updated);
    onSaveJournal(dayIndex, updated);
  };

  const handleSaveUserVerse = (e) => {
    e.preventDefault();
    if (!verseRef.trim() || !verseText.trim()) return;
    onAddVerse({ reference: verseRef.trim(), text: verseText.trim() });
    setVerseRef('');
    setVerseText('');
    setShowAddVerse(false);
  };

  // 365-day Heatmap calculation
  const monthsData = useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date();
    const result = Array.from({ length: 12 }, (_, m) => ({ month: m + 1, days: [] }));

    for (let i = 1; i <= 365; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i - 1);
      const m = d.getMonth();
      result[m].days.push({ dayIndex: i, date: d });
    }
    return result;
  }, [startDate]);

  const getCellColor = (i) => {
    if (i > dayIndex) {
      return isLight ? 'bg-slate-200' : 'bg-slate-800/80';
    }
    if (isDayComplete ? isDayComplete(i) : false) {
      return 'bg-emerald-500';
    }
    if (isDayMissed ? isDayMissed(i) : false) {
      return isLight ? 'bg-red-400' : 'bg-red-500/70';
    }
    return 'bg-indigo-500';
  };

  const totalComplete = useMemo(() => {
    if (!isDayComplete) return 0;
    return Object.keys(allProgress).filter(k => isDayComplete(parseInt(k))).length;
  }, [allProgress, isDayComplete]);

  const percentComplete = Math.round((totalComplete / 365) * 100);

  // Display user's saved verse
  const currentSavedVerse = verses.length > 0
    ? verses[(dayIndex - 1) % verses.length]
    : null;

  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const completed = [progress?.psalmsProverbs, progress?.newTestament, progress?.oldTestament].filter(Boolean).length;

  const readingCards = [
    {
      key: 'psalmsProverbs', icon: '🎵',
      label: 'Thi Thiên / Châm Ngôn',
      text: dayData?.readings?.psalmsProverbs || '',
      bg: isLight
        ? 'bg-purple-50/90 border-purple-200 hover:border-purple-300'
        : 'bg-purple-950/40 border-purple-800/60 hover:border-purple-700/80',
      labelColor: isLight ? 'text-purple-800' : 'text-purple-300',
    },
    {
      key: 'newTestament', icon: '✝️',
      label: 'Tân Ước',
      text: dayData?.readings?.newTestament || '',
      bg: isLight
        ? 'bg-sky-50/90 border-sky-200 hover:border-sky-300'
        : 'bg-sky-950/40 border-sky-800/60 hover:border-sky-700/80',
      labelColor: isLight ? 'text-sky-800' : 'text-sky-300',
    },
    {
      key: 'oldTestament', icon: '📜',
      label: 'Cựu Ước (Biên niên)',
      text: dayData?.readings?.oldTestament || '',
      bg: isLight
        ? 'bg-amber-50/90 border-amber-200 hover:border-amber-300'
        : 'bg-amber-950/40 border-amber-800/60 hover:border-amber-700/80',
      labelColor: isLight ? 'text-amber-800' : 'text-amber-300',
    },
  ];

  const t = {
    date: isLight ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium',
    day: isLight ? 'text-slate-900 font-extrabold' : 'text-white font-extrabold',
    name: isLight ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-bold',
    badge: isLight ? 'bg-indigo-100 text-indigo-800 font-bold' : 'bg-indigo-950 text-indigo-300 border border-indigo-800',
    cardText: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    journalCard: isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-950 border-slate-800',
    journalHeader: isLight ? 'text-slate-900' : 'text-slate-100',
    journalSub: isLight ? 'text-slate-500' : 'text-slate-400',
    promptLabel: isLight ? 'text-slate-900' : 'text-slate-100',
    promptSub: isLight ? 'text-slate-500' : 'text-slate-400',
    textarea: isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
      : 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900',
    input: isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
      : 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      {/* Main Header */}
      <div className="animate-fade-in-up">
        <p className={`text-sm sm:text-base capitalize ${t.date}`}>{dateStr}</p>
        <div className="flex items-center justify-between mt-1 gap-2">
          <h1 className={`text-3xl sm:text-4xl ${t.day}`}>Ngày {dayIndex}</h1>
          <span className={`text-sm sm:text-base px-3.5 py-1.5 rounded-full whitespace-nowrap ${t.badge}`}>
            {completed}/3 hoàn thành
          </span>
        </div>
        {userName && (
          <p className={`text-base sm:text-lg mt-2 ${t.date}`}>
            Xin chào, <span className={t.name}>{userName}</span> 👋
          </p>
        )}
      </div>

      {/* Alert Banner for Missed Days (if any) */}
      {missedCount > 0 && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-fade-in-up ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/60 border-amber-800 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Bạn có {missedCount} ngày chưa đọc bù</p>
              <p className="text-xs opacity-80">Không sao cả, hãy đọc lại khi sẵn sàng.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab?.('catchup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              isLight ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}>
            Đọc bù ngay
          </button>
        </div>
      )}

      {/* ── Ultra-Compact 365-Day Progress Bar & Heatmap Strip ─────────── */}
      <div className={`rounded-2xl border overflow-hidden animate-fade-in-up ${t.journalCard}`}>
        <button
          onClick={() => setHeatmapOpen(!heatmapOpen)}
          className={`w-full flex items-center justify-between p-3.5 sm:p-4 transition-colors cursor-pointer ${
            isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
          }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`font-bold text-xs sm:text-sm truncate ${t.journalHeader}`}>
                  Hành Trình 365 Ngày
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  {totalComplete}/365 ({percentComplete}%)
                </span>
              </div>
              {/* Mini Horizontal Gradient Progress Bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.max(percentComplete, 2)}%` }}
                />
              </div>
            </div>
          </div>
          {heatmapOpen
            ? <ChevronUp className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            : <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          }
        </button>

        {heatmapOpen && (
          <div className={`border-t p-4 space-y-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-3 pt-1">
              {monthsData.map(({ month, days }) => (
                <div key={month}>
                  <p className={`text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {MONTHS_VI[month - 1]}
                  </p>
                  <div className="grid grid-cols-4 gap-[3px]">
                    {days.map(({ dayIndex: dIdx }) => (
                      <div
                        key={dIdx}
                        title={`Ngày ${dIdx}`}
                        className={`w-3.5 h-3.5 rounded-[2px] transition-colors ${getCellColor(dIdx)}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-around pt-2 text-[11px] border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-[2px] bg-emerald-500" />
                <span className={t.journalSub}>Đã xong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-[2px] ${isLight ? 'bg-red-400' : 'bg-red-500/70'}`} />
                <span className={t.journalSub}>Bỏ lỡ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-[2px] bg-indigo-500" />
                <span className={t.journalSub}>Hôm nay</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User's Custom Verse Vault Widget */}
      <div className={`p-4 sm:p-5 rounded-2xl border animate-fade-in-up ${
        isLight ? 'bg-indigo-50/80 border-indigo-200' : 'bg-indigo-950/40 border-indigo-800/80'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-indigo-800' : 'text-indigo-300'
            }`}>
              Câu Gốc Tôi Lưu {verses.length > 0 ? `(${verses.length})` : ''}
            </span>
          </div>

          <button
            onClick={() => setShowAddVerse(!showAddVerse)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu gốc</span>
          </button>
        </div>

        {/* Inline Add Verse Form */}
        {showAddVerse && (
          <form onSubmit={handleSaveUserVerse} className={`mb-4 p-3.5 rounded-xl border space-y-3 ${
            isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-slate-700'
          }`}>
            <p className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Ghi lại câu Kinh Thánh bạn thích khi đọc hôm nay:
            </p>
            <input
              type="text"
              value={verseRef}
              onChange={e => setVerseRef(e.target.value)}
              placeholder="Tham chiếu (vd: Giăng 3:16)"
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${t.input}`}
              required
            />
            <textarea
              value={verseText}
              onChange={e => setVerseText(e.target.value)}
              placeholder="Nội dung câu Kinh Thánh..."
              rows={2}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none leading-relaxed ${t.input}`}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVerse(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`}>
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500">
                Lưu vào Kho
              </button>
            </div>
          </form>
        )}

        {/* Verse Content or Empty State */}
        {currentSavedVerse ? (
          <div>
            <p className={`text-xs sm:text-sm font-bold uppercase tracking-wide mb-1 ${
              isLight ? 'text-indigo-700' : 'text-indigo-400'
            }`}>
              {currentSavedVerse.reference}
            </p>
            <p className={`text-base sm:text-lg font-medium leading-relaxed italic ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}>
              "{currentSavedVerse.text}"
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Bạn chưa lưu câu gốc nào. Khi đọc bài đọc hôm nay, bấm <strong>"Thêm câu gốc"</strong> để ghi lại những câu đụng chạm lòng bạn!
            </p>
          </div>
        )}
      </div>

      {/* Reading Cards (Large Text & Easy Tapping) */}
      <div className="space-y-3">
        <h2 className={`text-sm sm:text-base font-bold uppercase tracking-wider ${t.date}`}>
          Kế Hoạch Đọc Hôm Nay
        </h2>
        {readingCards.map(({ key, icon, label, text, bg, labelColor }, i) => (
          <div key={key} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <label className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] ${bg} ${
              progress?.[key] ? 'opacity-60' : ''
            }`}>
              <input
                id={`read-${key}`}
                type="checkbox"
                className="reading-checkbox w-6 h-6"
                checked={progress?.[key] || false}
                onChange={e => onMarkReading(dayIndex, key, e.target.checked)}
              />
              <span className="text-3xl flex-shrink-0">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold mb-0.5 ${labelColor}`}>{label}</p>
                <p className={`text-base sm:text-lg leading-snug ${progress?.[key] ? 'line-through opacity-70' : t.cardText}`}>
                  {text}
                </p>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Integrated 4-Point Bible Journal */}
      <div className={`rounded-2xl border overflow-hidden animate-fade-in-up ${t.journalCard}`}>
        <button
          id="journal-toggle"
          onClick={() => setJournalOpen(!journalOpen)}
          className={`w-full flex items-center justify-between p-4 sm:p-5 transition-colors cursor-pointer ${
            isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
          }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-indigo-50 border border-indigo-200' : 'bg-indigo-950/80 border border-indigo-800'
            }`}>
              <span className="text-2xl">✍️</span>
            </div>
            <div className="text-left">
              <p className={`font-extrabold text-base sm:text-lg ${t.journalHeader}`}>Nhật ký Kinh Thánh</p>
              <p className={`text-xs sm:text-sm ${t.journalSub}`}>4 điểm phản chiếu từ Lời Chúa</p>
            </div>
          </div>
          {journalOpen
            ? <ChevronUp className={`w-5 h-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            : <ChevronDown className={`w-5 h-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          }
        </button>

        {journalOpen && (
          <div className={`border-t p-4 sm:p-5 space-y-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            {JOURNAL_PROMPTS.map(({ key, emoji, label, sub }) => (
              <div key={key}>
                <label className={`flex items-center gap-2 text-base font-bold mb-2 ${t.promptLabel}`}>
                  <span className="text-lg">{emoji}</span> {label}
                  <span className={`text-xs sm:text-sm font-normal ${t.promptSub}`}>— {sub}</span>
                </label>
                <textarea
                  id={`journal-${key}`}
                  value={localJournal[key] || ''}
                  onChange={e => handleJournalChange(key, e.target.value)}
                  placeholder={`Nhập ${label.toLowerCase()}...`}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none text-base transition-all leading-relaxed ${t.textarea}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
