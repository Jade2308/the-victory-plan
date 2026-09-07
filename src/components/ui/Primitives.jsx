import { useTheme } from '../../context/ThemeContext.jsx';

export function Badge({ children, variant = 'default' }) {
  const theme = useTheme();
  const isLight = theme === 'light';

  const variants = {
    default: isLight
      ? 'bg-slate-100 text-slate-700 border border-slate-300'
      : 'bg-[#1a2b23] text-slate-300 border border-[#2c4337]',
    success: isLight
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium'
      : 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium',
    warning: isLight
      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-medium'
      : 'bg-amber-950 text-amber-300 border border-amber-800 font-medium',
    danger: isLight
      ? 'bg-red-100 text-red-800 border border-red-300 font-medium'
      : 'bg-red-950 text-red-300 border border-red-800 font-medium',
    info: isLight
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium'
      : 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }) {
  const theme = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 border ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#112019] border-[#23372d] text-slate-200'
      }`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
        {title}
      </h3>
      <p className={`text-sm max-w-xs leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        {description}
      </p>
      {action}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, id, type = 'button' }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm';
      case 'secondary':
        return isLight
          ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
          : 'bg-[#112019] hover:bg-[#1a2b23] text-slate-200 border border-[#2c4337]';
      case 'ghost':
        return isLight
          ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
          : 'hover:bg-[#1a2b23] text-slate-400 hover:text-slate-200';
      case 'danger':
        return isLight
          ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
          : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800';
      case 'success':
        return isLight
          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800';
      default:
        return '';
    }
  };

  return (
    <button type={type} id={id} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-150
        active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
        ${sizes[size]} ${getVariantClass()} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', onClick, id }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const base = isLight
    ? 'bg-white border border-slate-200 text-slate-900 shadow-xs'
    : 'bg-[#0b1410] border border-[#23372d] text-slate-100';

  return (
    <div id={id}
      onClick={onClick}
      className={`rounded-2xl ${base} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  const theme = useTheme();
  const isLight = theme === 'light';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border animate-fade-in-up ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900'
          : 'bg-[#0b1410] border-[#23372d] text-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {title}
          </h3>
          <button onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a2b23] text-slate-400'
            }`}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
