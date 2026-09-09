import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../hooks/useNotifications.js';
import { Card, Button, Badge } from './ui/Primitives.jsx';
import CloudSyncCard from './CloudSyncCard.jsx';
import {
  User, Calendar, Bell, Check, Cloud, Save, BarChart2,
  Smartphone, LogOut, Download
} from 'lucide-react';

export default function SettingsPage({
  settings, onUpdate, totalCompleted, currentDayIndex, theme,
  onImport, localData, onNavigateTab, syncHook, refreshData,
  pwa, onOpenInstallModal
}) {
  const isLight = theme === 'light';
  const { schedule, saveSchedule, permission, requestPermission, sendTestNotification } = useNotifications();
  
  const [name, setName] = useState(settings.userName || '');
  const [savedName, setSavedName] = useState(false);

  const handleNameSave = () => {
    onUpdate({ ...settings, userName: name });
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
  };

  const handleSignOut = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
      if (syncHook?.signOut) {
        await syncHook.signOut();
      }
      try {
        localStorage.clear();
      } catch {}
      window.location.reload();
    }
  };


  const t = {
    h2: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-600' : 'text-slate-400',
    sectionTitle: isLight ? 'text-slate-900 font-semibold' : 'text-slate-100 font-semibold',
    card: isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b1410] border-[#23372d]',
    label: isLight ? 'text-slate-800 font-semibold' : 'text-slate-200 font-semibold',
    input: isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
      : 'bg-[#112019] border-[#2c4337] text-slate-100 placeholder-slate-500 focus:border-emerald-500',
    divider: isLight ? 'border-slate-200' : 'border-[#23372d]',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className={`text-2xl ${t.h2}`}>Cài Đặt ⚙️</h2>
        <p className={`text-sm mt-1 ${t.sub}`}>Tùy chỉnh trải nghiệm của bạn</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h3 className={`text-sm mb-3 flex items-center gap-2 ${t.sectionTitle}`}>
            <User className="w-4 h-4 text-emerald-500" /> Hồ sơ
          </h3>
          <Card className={`p-4 space-y-4 ${t.card}`}>
            <div>
              <label className={`block text-xs mb-1.5 ${t.label}`}>Tên của bạn</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`flex-1 px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none ${t.input}`}
                />
                <Button size="sm" onClick={handleNameSave}>
                  {savedName ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className={`pt-4 border-t ${t.divider}`}>
              <label className={`block text-xs mb-1.5 ${t.label}`}>Ngày bắt đầu kế hoạch</label>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  {new Date(settings.startDate).toLocaleDateString('vi-VN')}
                </span>
                <Badge variant="info">Ngày thứ {currentDayIndex}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress & Stats Shortcuts for Mobile */}
        <div className="md:hidden animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
          <h3 className={`text-sm mb-3 flex items-center gap-2 ${t.sectionTitle}`}>
            <BarChart2 className="w-4 h-4 text-emerald-500" /> Thống kê & Tiến độ
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className={`p-4 text-center cursor-pointer transition-all ${t.card}`} onClick={() => onNavigateTab?.('weekly')}>
              <BarChart2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
              <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Tuần này</p>
              <p className={`text-xs ${t.sub}`}>Tiến độ 7 ngày</p>
            </Card>
            <Card className={`p-4 text-center cursor-pointer transition-all ${t.card}`} onClick={() => onNavigateTab?.('heatmap')}>
              <Calendar className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
              <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Cả năm</p>
              <p className={`text-xs ${t.sub}`}>Bản đồ 365 ngày</p>
            </Card>
          </div>
        </div>
        
        {/* Cloud Sync */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className={`text-sm mb-3 flex items-center gap-2 ${t.sectionTitle}`}>
            <Cloud className="w-4 h-4 text-emerald-500" /> Đồng bộ Đám mây
          </h3>
          <CloudSyncCard syncHook={syncHook} refreshData={refreshData} />
        </div>

        {/* Notifications */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3 className={`text-sm mb-3 flex items-center gap-2 ${t.sectionTitle}`}>
            <Bell className="w-4 h-4 text-emerald-500" /> Thông báo nhắc nhở
          </h3>
          <Card className={`p-4 space-y-4 ${t.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Nhắc nhở hàng ngày</p>
                <p className={`text-xs ${t.sub}`}>
                  {permission === 'granted' ? 'Đã cấp quyền' : permission === 'denied' ? 'Đã từ chối quyền' : 'Chưa cấp quyền'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer"
                  checked={schedule.enabled}
                  onChange={async (e) => {
                    const enabled = e.target.checked;
                    if (enabled && permission !== 'granted') {
                      const p = await requestPermission();
                      if (p !== 'granted') {
                        alert('Bạn cần cấp quyền thông báo trong trình duyệt!');
                        return;
                      }
                    }
                    saveSchedule({ ...schedule, enabled });
                  }}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-[#1a2b23] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[#2c4337] peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {schedule.enabled && (
              <div className={`pt-4 border-t flex items-center gap-4 ${t.divider}`}>
                <div className="flex-1">
                  <label className={`block text-xs mb-1.5 ${t.label}`}>Giờ nhắc nhở</label>
                  <input
                    type="time"
                    value={`${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':');
                      saveSchedule({ ...schedule, hour: parseInt(h), minute: parseInt(m) });
                    }}
                    className={`px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none ${t.input} ${isLight ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={sendTestNotification} className="mt-5">
                  Thử nghiệm
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* App Installation / PWA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.18s' }}>
          <h3 className={`text-sm mb-3 flex items-center gap-2 ${t.sectionTitle}`}>
            <Smartphone className="w-4 h-4 text-emerald-500" /> Cài đặt ứng dụng (App)
          </h3>
          <Card className={`p-4 space-y-3 ${t.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  Trạng thái ứng dụng
                </p>
                <p className={`text-xs ${t.sub}`}>
                  {pwa?.isInstalled ? 'Đang chạy dưới dạng app độc lập' : 'Đang mở trên trình duyệt web'}
                </p>
              </div>
              <Badge variant={pwa?.isInstalled ? 'success' : 'neutral'}>
                {pwa?.isInstalled ? 'Đã cài đặt' : 'Chưa cài đặt'}
              </Badge>
            </div>

            <p className={`text-xs leading-relaxed ${t.sub}`}>
              Cài đặt Chiến Thắng vào thiết bị giúp bạn mở nhanh từ màn hình chính, sử dụng toàn màn hình không có thanh URL, và lưu dữ liệu để đọc offline khi không có internet.
            </p>

            <div className="pt-1">
              <Button
                variant={pwa?.isInstalled ? 'secondary' : 'primary'}
                className="w-full justify-center"
                onClick={() => {
                  if (pwa?.canPromptDirectly) {
                    pwa.promptInstall();
                  } else {
                    onOpenInstallModal?.();
                  }
                }}
              >
                <Download className="w-4 h-4" />
                {pwa?.isInstalled ? 'Xem thông tin & Hướng dẫn' : 'Cài đặt ứng dụng vào thiết bị'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Account / Logout */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className={`text-sm mb-3 flex items-center gap-2 ${t.sectionTitle}`}>
            <User className="w-4 h-4 text-emerald-500" /> Tài khoản & Đăng xuất
          </h3>
          <Card className={`p-4 space-y-4 ${t.card}`}>
            {syncHook?.user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${t.sub}`}>Tài khoản đang đăng nhập</p>
                  <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {syncHook.user.email}
                  </p>
                </div>
                <Badge variant="success">Đã kết nối</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${t.sub}`}>Trạng thái tài khoản</p>
                  <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Chưa đăng nhập tài khoản
                  </p>
                </div>
                <Badge variant="neutral">Chưa kết nối</Badge>
              </div>
            )}

            <div className={`pt-3 border-t ${t.divider}`}>
              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
