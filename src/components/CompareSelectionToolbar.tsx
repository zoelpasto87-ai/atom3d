import React from 'react';
import { ChemicalElement } from '../types/element';
import { Scale, RotateCcw, X, Check, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../utils/categories';

interface CompareSelectionToolbarProps {
  selectedElements: ChemicalElement[];
  warningMessage: string | null;
  onClearWarning: () => void;
  onRemoveElement: (index: number) => void;
  onResetSelection: () => void;
  onStartComparison: () => void;
  onCancel: () => void;
}

export const CompareSelectionToolbar: React.FC<CompareSelectionToolbarProps> = ({
  selectedElements,
  warningMessage,
  onClearWarning,
  onRemoveElement,
  onResetSelection,
  onStartComparison,
  onCancel,
}) => {
  const count = selectedElements.length;
  const isComplete = count === 3;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border-2 border-amber-500/60 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in duration-200">
      {/* Top Header: Title, Instruction, and Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                Mode Pemilihan: Bandingkan 3 Unsur
              </h3>
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isComplete
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-amber-950 text-amber-300 border-amber-600'
                }`}
              >
                {count} / 3 unsur dipilih
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {isComplete ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  3 unsur telah dipilih.
                </span>
              ) : (
                <span className="text-amber-200/90">
                  Pilih 3 unsur dari tabel periodik. (Klik kotak unsur untuk memilih)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Bandingkan, Reset, Batal */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onResetSelection}
            disabled={count === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              count > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Hapus semua pilihan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pilihan</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium border border-slate-700/60 transition-all cursor-pointer"
            title="Keluar dari mode pemilihan"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Batal</span>
          </button>

          <button
            type="button"
            onClick={onStartComparison}
            disabled={!isComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 ring-2 ring-amber-400/50 cursor-pointer scale-105 active:scale-100'
                : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            <span>Bandingkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning message if user selects duplicate or tries to select 4th */}
      {warningMessage && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{warningMessage}</span>
          </div>
          <button
            type="button"
            onClick={onClearWarning}
            className="text-rose-400 hover:text-white p-1 rounded hover:bg-rose-900/60 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected 3 Elements List (exact user format requirement) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Daftar Unsur Terpilih:
        </span>
        {count === 0 ? (
          <div className="p-3 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
            Belum ada unsur dipilih. Silakan ketuk atau klik kotak unsur pada tabel periodik di bawah.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {selectedElements.map((el, index) => {
              const cat = CATEGORIES[el.category];
              return (
                <div
                  key={el.atomicNumber}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-md ring-1 ring-amber-500/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white truncate">
                        <span className="text-amber-400 font-mono">
                          {index + 1}. {el.symbol}
                        </span>
                        <span className="text-slate-400">—</span>
                        <span className="truncate">{el.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        Z={el.atomicNumber} • {el.category}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveElement(index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0 ml-1"
                    title={`Hapus ${el.name} dari pilihan`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {/* Placeholders for remaining slots */}
            {count < 3 &&
              Array.from({ length: 3 - count }).map((_, i) => (
                <div
                  key={`empty-slot-${i}`}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-xs text-slate-600 font-medium"
                >
                  <span>Pilih unsur ke-{count + i + 1} ...</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
