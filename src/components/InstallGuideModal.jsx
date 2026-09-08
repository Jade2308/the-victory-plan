import { useState } from 'react';
import { X, Download, Smartphone, Monitor, Share2, PlusSquare, MoreVertical } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function InstallGuideModal({ isOpen, onClose, isIOS, canPromptDirectly, onPromptInstall }) {
  const [activeTab, setActiveTab] = useState(() => (isIOS ? 'ios' : 'desktop'));
  const theme = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const bgModal = isLight ? 'bg-white text-slate-900' : 'bg-[#112019] text-slate-100 border border-[#2c4337]';
  const stepBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1410] border-[#23372d]';
  const tagBg = isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${bgModal}`}>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-[#23372d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
              <img src="/victory-plan-mark.svg" alt="Logo" className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cài Đặt Ứng Dụng</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sử dụng như ứng dụng độc lập, nhanh hơn & đọc offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2b23] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-click Install Button (If browser supports native prompt) */}
        {canPromptDirectly && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Trình duyệt đã sẵn sàng cài đặt!
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Bấm nút bên cạnh để mở hộp thoại cài đặt ngay lập tức.
              </p>
            </div>
            <button
              onClick={async () => {
                const res = await onPromptInstall();
                if (res.success) onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Cài đặt ngay
            </button>
          </div>
        )}

        {/* Tabs: Máy tính / iPhone (iOS) / Android */}
        <div className="flex gap-2 mt-4 p-1 rounded-xl bg-slate-100 dark:bg-[#0b1410] border border-slate-200 dark:border-[#23372d]">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-[#1a2b23] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Máy tính (PC/Mac)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-[#1a2b23] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-[#1a2b23] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
        </div>

        {/* Content per tab */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'desktop' && (
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${stepBg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tagBg}`}>Cách 1</span>
                  <span className="font-bold text-sm">Thanh địa chỉ trình duyệt</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Nhìn vào <strong>phía bên phải thanh địa chỉ (URL)</strong> của trình duyệt (Chrome hoặc Microsoft Edge). Bạn sẽ thấy biểu tượng:
                </p>
                <div className="mt-2.5 p-2 rounded-lg bg-slate-200/50 dark:bg-[#1a2b23] flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-emerald-600 text-white">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Chrome: Biểu tượng màn hình có mũi tên xuống (Cài đặt)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Edge: Biểu tượng 3 ô vuông có dấu cộng (+)
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${stepBg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tagBg}`}>Cách 2</span>
                  <span className="font-bold text-sm">Qua menu 3 chấm của trình duyệt</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>Bấm vào biểu tượng <strong>3 chấm (⋮)</strong> ở góc trên cùng bên phải trình duyệt.</li>
                  <li>Chọn mục <strong>&ldquo;Lưu và chia sẻ&rdquo;</strong> hoặc <strong>&ldquo;Cài đặt và hiệu suất&rdquo;</strong>.</li>
                  <li>Bấm <strong>&ldquo;Cài đặt Chiến Thắng - Kế Hoạch Đọc Kinh Thánh...&rdquo;</strong> (hoặc <em>Install Victory Plan</em>).</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${stepBg}`}>
                <p className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                  Trên iOS (iPhone/iPad), trình duyệt Safari không hỗ trợ nút cài đặt trực tiếp trên thanh link mà cần cài qua tính năng của hệ điều hành:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Nhấn vào nút Chia sẻ (Share)
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        Biểu tượng hình vuông có mũi tên hướng lên <Share2 className="w-3.5 h-3.5 inline text-emerald-500" /> ở thanh công cụ dưới đáy Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Chọn &ldquo;Thêm vào MH chính&rdquo; (Add to Home Screen)
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        Cuộn danh sách tùy chọn xuống và bấm <PlusSquare className="w-3.5 h-3.5 inline text-emerald-500" /> <strong>Thêm vào MH chính</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Xác nhận &ldquo;Thêm&rdquo; (Add)
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Nhấn nút <strong>Thêm</strong> ở góc trên bên phải màn hình để đưa icon ứng dụng ra màn hình chính.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${stepBg}`}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Mở menu trình duyệt Chrome
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        Bấm vào biểu tượng <strong>3 chấm dọc (<MoreVertical className="w-3.5 h-3.5 inline text-emerald-500" />)</strong> ở góc trên cùng bên phải.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Chọn &ldquo;Cài đặt ứng dụng&rdquo; hoặc &ldquo;Thêm vào màn hình chính&rdquo;
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Chọn <strong>Cài đặt ứng dụng</strong> (hoặc <em>Install app</em>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Bấm &ldquo;Cài đặt&rdquo; để hoàn tất
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Ứng dụng sẽ xuất hiện trên màn hình điện thoại như một app chuyên nghiệp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#23372d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#1a2b23] hover:bg-slate-300 dark:hover:bg-[#23372d] text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
