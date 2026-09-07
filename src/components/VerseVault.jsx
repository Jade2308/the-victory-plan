import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button, EmptyState } from './ui/Primitives.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const CARD_STYLES_LIGHT = [
  'bg-emerald-50/80 border-emerald-200 text-emerald-950',
  'bg-emerald-50/80 border-emerald-200 text-emerald-950',
  'bg-amber-50/80 border-amber-200 text-amber-950',
  'bg-sky-50/80 border-sky-200 text-sky-950',
  'bg-rose-50/80 border-rose-200 text-rose-950',
];

const CARD_STYLES_DARK = [
  'bg-[#112019]/70 border-[#2c4337] text-slate-100',
  'bg-[#112019]/70 border-[#2c4337] text-slate-100',
  'bg-amber-950/40 border-amber-800/60 text-amber-100',
  'bg-sky-950/40 border-sky-800/60 text-sky-100',
  'bg-rose-950/40 border-rose-800/60 text-rose-100',
];

export default function VerseVault({ verses, onAdd, onDelete }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const [showForm, setShowForm] = useState(false);
  const [ref, setRef] = useState('');
  const [text, setText] = useState('');
  const [cardIndex, setCardIndex] = useState(0);

  const handleAdd = () => {
    if (!ref.trim() || !text.trim()) return;
    onAdd({ reference: ref.trim(), text: text.trim() });
    setRef('');
    setText('');
    setShowForm(false);
    setCardIndex(0);
  };

  const t = {
    h2: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-600' : 'text-slate-400',
    count: isLight ? 'text-slate-600' : 'text-slate-400',
    refText: isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold',
    verseText: isLight ? 'text-slate-900 font-medium' : 'text-slate-100 font-medium',
    addedAt: isLight ? 'text-slate-500' : 'text-slate-400',
    input: isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
      : 'bg-[#112019] border-[#2c4337] text-slate-100 placeholder-slate-500 focus:border-emerald-500',
    label: isLight ? 'text-slate-800 font-semibold' : 'text-slate-200 font-semibold',
    formCard: isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b1410] border-[#23372d]',
    dot: isLight ? 'bg-slate-300' : 'bg-slate-700',
    dotActive: isLight ? 'bg-emerald-600' : 'bg-emerald-400',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className={`text-2xl ${t.h2}`}>Kho Câu Gốc ⭐</h2>
          <p className={`text-sm mt-1 ${t.sub}`}>
            {verses.length} câu đã lưu
          </p>
        </div>
        <Button id="add-verse-btn" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Thêm câu
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className={`rounded-2xl border p-4 space-y-3 animate-fade-in-up ${t.formCard}`}>
          <p className={`text-sm ${t.label}`}>Thêm câu gốc mới</p>
          <input
            id="verse-ref-input"
            type="text"
            value={ref}
            onChange={e => setRef(e.target.value)}
            placeholder="Tham chiếu (vd: Giăng 3:16)"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${t.input}`}
          />
          <textarea
            id="verse-text-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Nội dung câu Kinh Thánh..."
            rows={3}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-all leading-relaxed ${t.input}`}
          />
          <div className="flex gap-2">
            <Button id="verse-cancel-btn" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
            <Button id="verse-save-btn" size="sm" onClick={handleAdd} disabled={!ref.trim() || !text.trim()}>
              Lưu câu gốc
            </Button>
          </div>
        </div>
      )}

      {/* Flashcards */}
      {verses.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Chưa có câu gốc nào"
          description="Thêm câu Kinh Thánh để ghi nhớ và ôn tập hàng ngày."
        />
      ) : (
        <div className="space-y-4">
          {/* Flashcard */}
          <div className="relative animate-fade-in-up">
            {verses.map((verse, i) => {
              const styles = isLight ? CARD_STYLES_LIGHT : CARD_STYLES_DARK;
              const style = styles[i % styles.length];
              if (i !== cardIndex) return null;

              return (
                <div key={verse.id}
                  className={`relative rounded-2xl border p-6 min-h-[180px] flex flex-col justify-between ${style}`}>
                  <div>
                    <p className={`text-xs uppercase tracking-wider mb-3 ${t.refText}`}>
                      {verse.reference}
                    </p>
                    <p className={`text-base leading-relaxed ${t.verseText}`}>
                      "{verse.text}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs ${t.addedAt}`}>
                      {new Date(verse.addedAt).toLocaleDateString('vi-VN')}
                    </span>
                    <button
                      id={`delete-verse-${verse.id}`}
                      onClick={() => {
                        onDelete(verse.id);
                        setCardIndex(Math.max(0, cardIndex - 1));
                      }}
                      className={`p-2 rounded-xl transition-colors ${
                        isLight
                          ? 'hover:bg-red-100 text-slate-500 hover:text-red-700'
                          : 'hover:bg-red-950 text-slate-400 hover:text-red-300'
                      }`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          {verses.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                id="prev-verse"
                onClick={() => setCardIndex(i => Math.max(0, i - 1))}
                disabled={cardIndex === 0}
                className={`p-2 rounded-xl transition-colors disabled:opacity-30 ${
                  isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-[#1a2b23] text-slate-300'
                }`}>
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-1.5 items-center">
                {verses.slice(0, 10).map((_, i) => (
                  <button key={i} onClick={() => setCardIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === cardIndex ? `${t.dotActive} w-4` : t.dot
                    }`} />
                ))}
                {verses.length > 10 && (
                  <span className={`text-xs ${t.count}`}>+{verses.length - 10}</span>
                )}
              </div>

              <button
                id="next-verse"
                onClick={() => setCardIndex(i => Math.min(verses.length - 1, i + 1))}
                disabled={cardIndex === verses.length - 1}
                className={`p-2 rounded-xl transition-colors disabled:opacity-30 ${
                  isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-[#1a2b23] text-slate-300'
                }`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <p className={`text-center text-xs ${t.count}`}>
            {cardIndex + 1} / {verses.length} câu gốc
          </p>
        </div>
      )}
    </div>
  );
}
