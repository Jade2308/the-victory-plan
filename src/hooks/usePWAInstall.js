import { useState, useEffect, useCallback } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  });
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent default mini-infobar or auto prompt
      e.preventDefault();
      // Stash event so it can be triggered later
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        return { success: true, outcome: choiceResult.outcome };
      } catch (err) {
        console.error('Lỗi khi kích hoạt cài đặt PWA:', err);
        return { success: false, error: err };
      }
    }
    // Return false if native prompt is not available (e.g. iOS or manual guide needed)
    return { success: false, needGuide: true };
  }, [deferredPrompt]);

  return {
    canPromptDirectly: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    isMobile,
    promptInstall,
  };
}
