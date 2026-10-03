import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share2, PlusSquare, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE, APP_TAGLINE } from '../config/version';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 id="pwa-install-title" className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Pasang {APP_NAME} di HP</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">{APP_SUBTITLE}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan install"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-300 italic border-l-2 border-cyan-400 pl-3 py-0.5">
          "{APP_TAGLINE}"
        </p>

        {/* Content based on status */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{APP_NAME} Sudah Terpasang!</span>
            </div>
            <p className="text-slate-300">
              Aplikasi saat ini sudah berjalan dalam mode standalone di layar utamamu. Semua fitur lokal siap digunakan secara offline.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* If direct browser install prompt is available (Android / Chromium) */}
            {isInstallable && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang {APP_NAME} Sekarang</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Cepat, tanpa Google Play Store, hemat memori (~2 MB).
                </p>
              </div>
            )}

            {/* Android Chrome manual guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                <span>🤖 Untuk Android (Chrome / Edge):</span>
              </span>
              <ol className="space-y-1.5 text-slate-300 pl-4 list-decimal text-[11px]">
                <li>Buka ATOM 3D di browser Google Chrome.</li>
                <li>Tekan tombol menu titik tiga (⋮) di pojok kanan atas browser.</li>
                <li>Pilih <strong>"Tambahkan ke layar utama"</strong> atau <strong>"Install app"</strong>.</li>
                <li>Buka ATOM 3D langsung dari ikon di layar beranda smartphone.</li>
              </ol>
            </div>

            {/* iOS Safari manual guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <span>🍎 Untuk iPhone / iPad (Safari):</span>
              </span>
              <ol className="space-y-1.5 text-slate-300 pl-4 list-decimal text-[11px]">
                <li>Buka ATOM 3D di browser Safari.</li>
                <li>Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="w-3 h-3 inline text-cyan-400" /> di bilah bawah.</li>
                <li>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
                <li>Ketuk "Tambah" di pojok kanan atas.</li>
              </ol>
            </div>

            {/* Offline benefit reminder */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Setelah dipasang, seluruh 118 unsur kimia, model 3D, reaksi Chemistry Lab, kuis tantangan, dan analitik belajar dapat diakses kapan saja meski tanpa kuota internet.
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
