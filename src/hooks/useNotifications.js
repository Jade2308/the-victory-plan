import { useState, useEffect, useCallback } from 'react';

const SCHEDULE_KEY = 'ct_notif_schedule';

const DEFAULT_SCHEDULE = {
  enabled: false,
  hour: 7,
  minute: 0,
};

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  });

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const saveSchedule = useCallback((newSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(newSchedule));
  }, []);

  const sendTestNotification = useCallback(() => {
    if (permission !== 'granted') return;
    new Notification('🕊️ Chiến Thắng', {
      body: 'Đây là thông báo thử — giờ đọc Kinh Thánh đã đến!',
      icon: '/icons.svg',
    });
  }, [permission]);

  // Daily check via setInterval (runs every minute)
  useEffect(() => {
    if (permission !== 'granted' || !schedule.enabled) return;

    const check = () => {
      const now = new Date();
      if (now.getHours() === schedule.hour && now.getMinutes() === schedule.minute) {
        const lastKey = `ct_last_notif_${now.toDateString()}`;
        if (!localStorage.getItem(lastKey)) {
          new Notification('📖 Chiến Thắng', {
            body: 'Đã đến giờ đọc Kinh Thánh hôm nay! Hãy tiếp tục hành trình 365 ngày.',
            icon: '/icons.svg',
          });
          localStorage.setItem(lastKey, '1');
        }
      }
    };

    const interval = setInterval(check, 60000);
    check(); // check immediately on mount
    return () => clearInterval(interval);
  }, [permission, schedule]);

  return { permission, schedule, saveSchedule, requestPermission, sendTestNotification };
}
