import { useState } from 'react';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, EmptyState } from './ui/Primitives.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Reflections({ reflections, currentDayIndex, onSave }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState({});

  const blocks = [];
  for (let i = 30; i <= Math.max(currentDayIndex, 30); i += 30) {
    if (i <= 365) blocks.push(i);
  }

  const handleSave = (block) => {
    onSave(block, editing[block] || '');
  };

  const t = {
    h2: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-600' : 'text-slate-400',
    rowHover: isLight ? 'hover:bg-slate-50' : 'hover:bg-[#112019]/50',
    monthTitle: isLight ? 'text-slate-900 font-semibold' : 'text-slate-100 font-semibold',
    monthSub: isLight ? 'text-slate-500' : 'text-slate-400',
    chevron: isLight ? 'text-slate-500' : 'text-slate-400',
    borderSep: isLight ? 'border-slate-200' : 'border-[#23372d]',
    quote: isLight ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium',
    textarea: isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
      : 'bg-[#112019] border-[#2c4337] text-slate-100 placeholder-slate-500 focus:border-emerald-500',
    saveBtn: isLight
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs'
      : 'bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs',
    iconBg: isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#112019] border-[#2c4337]',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="animate-fade-in-up">
        <h2 className={`text-2xl ${t.h2}`}>Suy Ngẫm Hàng Tháng 🌿</h2>
        <p className={`text-sm mt-1 ${t.sub}`}>Những điều quan trọng nhất Đức Chúa Trời phán mỗi tháng</p>
      </div>

      {blocks.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Chưa đến ngày 30"
          description="Sau ngày 30 trong kế hoạch, bạn sẽ thấy phần suy ngẫm hàng tháng xuất hiện ở đây."
        />
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const monthNum = Math.floor(block / 30);
            const saved = reflections[block];
            const isOpen = expanded === block;
            const currentText = editing[block] !== undefined ? editing[block] : (saved?.text || '');

            return (
              <div key={block} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.04}s` }}>
                <Card className="overflow-hidden">
                  <button
                    id={`reflection-toggle-${block}`}
                    onClick={() => {
                      setExpanded(isOpen ? null : block);
                      if (!isOpen && saved?.text && editing[block] === undefined) {
                        setEditing(prev => ({ ...prev, [block]: saved.text }));
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 transition-colors text-left ${t.rowHover}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${t.iconBg}`}>
                        <span className="text-lg">{saved ? '✅' : '🌿'}</span>
                      </div>
                      <div>
                        <p className={`text-sm ${t.monthTitle}`}>Tháng {monthNum}</p>
                        <p className={`text-xs ${t.monthSub}`}>
                          Ngày {block - 29}–{block}
                          {saved ? ` · Đã lưu ${new Date(saved.savedAt).toLocaleDateString('vi-VN')}` : ' · Chưa ghi'}
                        </p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className={`w-4 h-4 ${t.chevron}`} /> : <ChevronDown className={`w-4 h-4 ${t.chevron}`} />}
                  </button>

                  {isOpen && (
                    <div className={`border-t p-4 space-y-3 ${t.borderSep}`}>
                      <p className={`text-sm italic ${t.quote}`}>
                        "Những điều quan trọng nhất Đức Chúa Trời phán với bạn trong tháng này là gì?"
                      </p>
                      <textarea
                        id={`reflection-text-${block}`}
                        value={currentText}
                        onChange={e => setEditing(prev => ({ ...prev, [block]: e.target.value }))}
                        placeholder="Hãy suy ngẫm và ghi lại..."
                        rows={5}
                        className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all text-sm leading-relaxed ${t.textarea}`}
                      />
                      <div className="flex justify-end">
                        <button
                          id={`reflection-save-${block}`}
                          onClick={() => handleSave(block)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer ${t.saveBtn}`}>
                          <Save className="w-4 h-4" />
                          Lưu suy ngẫm
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
