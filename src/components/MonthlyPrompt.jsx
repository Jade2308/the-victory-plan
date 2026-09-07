import { useState, useEffect } from 'react';
import { Modal, Button } from './ui/Primitives.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function MonthlyPrompt({ currentDayIndex, reflections, onSave, onDismiss }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const isMonthlyMilestone = currentDayIndex > 0 && currentDayIndex % 30 === 0;
  const block = currentDayIndex;
  const alreadySaved = !!reflections[block];
  const dismissKey = `ct_dismissed_reflection_${block}`;
  const isDismissed = !!localStorage.getItem(dismissKey);

  useEffect(() => {
    if (isMonthlyMilestone && !alreadySaved && !isDismissed) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isMonthlyMilestone, alreadySaved, isDismissed]);

  const handleSave = () => {
    onSave(block, text);
    setOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, '1');
    setOpen(false);
    onDismiss?.();
  };

  const inputClass = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20'
    : 'bg-[#112019]/70 border-[#2c4337] text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/15';

  return (
    <Modal open={open} onClose={handleDismiss} title={`🌿 Suy Ngẫm Tháng ${Math.floor(currentDayIndex / 30)}`}>
      <div className="space-y-4">
        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/25'
        }`}>
          <p className={`font-medium text-sm mb-1 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
            🎉 Chúc mừng! Bạn đã hoàn thành {currentDayIndex} ngày!
          </p>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Đây là thời điểm tuyệt vời để nhìn lại những gì Đức Chúa Trời đã phán trong tháng qua.
          </p>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 italic ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            "Những điều quan trọng nhất Đức Chúa Trời phán với bạn trong tháng qua là gì?"
          </label>
          <textarea
            id="monthly-reflection-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Hãy chia sẻ những điều Chúa đã phán qua Lời Ngài..."
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm leading-relaxed ${inputClass}`}
          />
        </div>

        <div className="flex gap-3">
          <Button id="monthly-dismiss-btn" variant="ghost" onClick={handleDismiss} className="flex-1 justify-center">
            Để sau
          </Button>
          <Button id="monthly-save-btn" variant="success" onClick={handleSave} className="flex-1 justify-center" disabled={!text.trim()}>
            💾 Lưu suy ngẫm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
