import React from 'react';
import { Atom, ShieldCheck, Cpu, Smartphone, Info } from 'lucide-react';
import { APP_VERSION, APP_YEAR, APP_AUTHOR, APP_NAME } from '../config/version';

interface FooterProps {
  onOpenAbout?: () => void;
  onOpenInstallGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, onOpenInstallGuide }) => {
  return (
    <footer className="mt-8 border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left: Branding */}
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Atom className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-sm text-white tracking-wide">
              {APP_NAME} — Interactive Periodic Table
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Jelajahi unsur. Pahami atom. Temukan dunia kimia.
          </p>
        </div>

        {/* Center: Phase info badge & quick links */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fase 1–11: 118 Unsur, Atom 3D, AR, Lab, Journey, Challenge, Progress & PWA Final</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {onOpenInstallGuide && (
              <button
                type="button"
                onClick={onOpenInstallGuide}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>Pasang PWA</span>
              </button>
            )}
            {onOpenAbout && (
              <button
                type="button"
                onClick={onOpenAbout}
                className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer ml-1"
              >
                <Info className="w-3 h-3" />
                <span>Tentang</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Copyright & Design Attribution */}
        <div className="space-y-0.5 md:text-right text-xs text-slate-400">
          <p className="font-semibold text-slate-300">
            © {APP_YEAR} — {APP_AUTHOR}
          </p>
          <p className="text-[11px] text-slate-500">
            Progressive Web App • Local Engine
          </p>
        </div>
      </div>
    </footer>
  );
};

