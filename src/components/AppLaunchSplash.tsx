import React, { useState, useEffect } from 'react';
import { Atom } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '../config/version';

export const AppLaunchSplash: React.FC<{ onFinished?: () => void }> = ({ onFinished }) => {
  const [visible, setVisible] = useState<boolean>(true);
  const [fading, setFading] = useState<boolean>(false);

  useEffect(() => {
    // Check if session has already shown splash in current tab
    const alreadyShown = sessionStorage.getItem('atom3d_splash_shown');
    if (alreadyShown) {
      setVisible(false);
      onFinished?.();
      return;
    }

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('atom3d_splash_shown', 'true');
        onFinished?.();
      }, 350);
    }, 650);

    return () => clearTimeout(timer);
  }, [onFinished]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 p-0.5 shadow-2xl shadow-cyan-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Atom className="w-9 h-9 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>ATOM</span>
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">3D</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">{APP_SUBTITLE}</p>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Memuat pengalaman belajar...</span>
        </div>
      </div>
    </div>
  );
};
