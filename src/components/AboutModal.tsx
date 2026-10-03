import React, { useState } from 'react';
import {
  APP_NAME,
  APP_VERSION,
  APP_SUBTITLE,
  APP_TAGLINE,
  APP_AUTHOR,
  APP_YEAR,
} from '../config/version';
import {
  Atom,
  Info,
  ShieldCheck,
  Cpu,
  Share2,
  Check,
  X,
  Sparkles,
  BookOpen,
  Layers,
  FlaskConical,
  Compass,
  Target,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstallGuide: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenInstallGuide }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    const shareData = {
      title: `${APP_NAME} — ${APP_SUBTITLE}`,
      text: `${APP_NAME}: ${APP_TAGLINE} Media pembelajaran kimia interaktif dengan 118 unsur, visualisasi 3D, dan virtual lab.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignore user cancellation
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Atom className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="about-modal-title" className="text-xl font-black text-white tracking-tight">
                  {APP_NAME}
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{APP_SUBTITLE}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela tentang"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-800/40 text-xs text-cyan-200 font-medium italic text-center">
          "{APP_TAGLINE}"
        </div>

        {/* Description */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>{APP_NAME}</strong> adalah media pembelajaran kimia interaktif yang dirancang untuk membantu peserta didik dan pendidik mengeksplorasi tabel periodik 118 unsur kimia, struktur atom dalam 3D, sifat keperiodikan, eksperimen laboratorium virtual, jalur pembelajaran terarah, kuis tantangan, serta visualisasi Augmented Reality (AR).
          </p>
          <p>
            Dikembangkan sebagai aplikasi web progresif (PWA) yang dapat dipasang di layar utama smartphone Android dan iOS tanpa instalasi Google Play Store, hemat kuota, dan dapat berjalan secara luring (offline).
          </p>
        </div>

        {/* Educational Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
          <span className="font-bold text-amber-300 block flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Keterangan Pedagogis & Model Atom:</span>
          </span>
          <p>
            Model atom pada aplikasi ini merupakan visualisasi pembelajaran untuk membantu memahami struktur atom dan distribusi elektron. Visualisasi ini bukan representasi literal orbital mekanika kuantum.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>118 Unsur Lengkap</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Atom className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Visualisasi Atom 3D</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Virtual Chemistry Lab</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Learning Journey</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Kuis & Evaluasi</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Progress Belajar Lokal</span>
          </div>
        </div>

        {/* Privacy & Engine info */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Privasi Penuh: Data disimpan lokal di perangkat.</span>
          </div>
          <span className="font-mono text-slate-500">Local Engine</span>
        </div>

        {/* Footer & Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-center sm:text-left text-slate-400">
            <span className="font-semibold text-slate-300 block">
              © {APP_YEAR} {APP_NAME} — {APP_AUTHOR}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan ATOM 3D'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInstallGuide();
              }}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold transition-all cursor-pointer"
            >
              Pasang PWA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
