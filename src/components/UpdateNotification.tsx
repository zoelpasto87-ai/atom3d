import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { APP_NAME } from '../config/version';

interface UpdateNotificationProps {
  onBeforeReload?: () => boolean; // return false to prevent reload if user is busy
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onBeforeReload }) => {
  const [needRefresh, setNeedRefresh] = useState<boolean>(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR or virtual module issues
    let isMounted = true;

    async function initSW() {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const updateFn = registerSW({
          onNeedRefresh() {
            if (isMounted) {
              setNeedRefresh(true);
            }
          },
          onOfflineReady() {
            // Service worker cached assets ready
          },
        });
        if (isMounted) {
          setUpdateSW(() => updateFn);
        }
      } catch (err) {
        // Fallback for browsers or environments without SW support
      }
    }

    initSW();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdate = async () => {
    if (onBeforeReload && !onBeforeReload()) {
      return;
    }
    if (updateSW) {
      await updateSW();
    } else {
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 border border-cyan-500/50 p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-2"
    >
      <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-cyan-400" />
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="text-xs font-bold text-white">Versi baru {APP_NAME} tersedia</h3>
        <p className="text-[11px] text-slate-300">
          Pembaruan siap digunakan. Tekan tombol perbarui untuk memuat versi terkini.
        </p>

        <div className="flex items-center gap-2 pt-1.5">
          <button
            type="button"
            onClick={handleUpdate}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Perbarui</span>
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Nanti
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="p-1 rounded-lg text-slate-500 hover:text-slate-300 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
