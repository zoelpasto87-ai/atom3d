import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface ObservationRecord {
  materials: string;
  observations: string;
  gasOrPrecipitate: string;
  conclusion: string;
  lastUpdated: string;
}

interface ObservationSheetModalProps {
  currentMaterials?: string;
  currentObservations?: string;
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'atom3d_virtual_lab_observations';

export const ObservationSheetModal: React.FC<ObservationSheetModalProps> = ({
  currentMaterials = '',
  currentObservations = '',
  isOpen,
  onClose,
}) => {
  const [record, setRecord] = useState<ObservationRecord>({
    materials: '',
    observations: '',
    gasOrPrecipitate: '',
    conclusion: '',
    lastUpdated: '',
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecord(JSON.parse(stored));
      } else if (currentMaterials) {
        setRecord((prev) => ({
          ...prev,
          materials: currentMaterials,
          observations: currentObservations,
        }));
      }
    } catch {
      // Fallback
    }
  }, [currentMaterials, currentObservations]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = {
      ...record,
      lastUpdated: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecord(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecord({
        materials: '',
        observations: '',
        gasOrPrecipitate: '',
        conclusion: '',
        lastUpdated: '',
      });
      setConfirmClear(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoFill = () => {
    if (currentMaterials) {
      setRecord((prev) => ({
        ...prev,
        materials: currentMaterials,
        observations: currentObservations || prev.observations,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Lembar Pengamatan Digital
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Catatan tersimpan sementara di peramban (lokal)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {currentMaterials && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs">
              <span className="text-cyan-300">
                Eksperimen aktif: <strong>{currentMaterials}</strong>
              </span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="px-2 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[11px] hover:bg-cyan-400 cursor-pointer"
              >
                Salin ke Catatan
              </button>
            </div>
          )}

          {/* Bahan yang diuji */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Bahan yang Dicampurkan:
            </label>
            <input
              type="text"
              value={record.materials}
              onChange={(e) => setRecord({ ...record, materials: e.target.value })}
              placeholder="Contoh: Cuka Dapur (CH₃COOH) + Soda Kue (NaHCO₃)"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Perubahan yang diamati */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Perubahan yang Diamati:
            </label>
            <textarea
              rows={2}
              value={record.observations}
              onChange={(e) => setRecord({ ...record, observations: e.target.value })}
              placeholder="Contoh: Muncul banyak gelembung gas mendesis secara aktif, larutan berbusa lalu kembali jernih..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Gas / Endapan / Perubahan Warna */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Gas / Endapan / Indikator Produk:
            </label>
            <input
              type="text"
              value={record.gasOrPrecipitate}
              onChange={(e) => setRecord({ ...record, gasOrPrecipitate: e.target.value })}
              placeholder="Contoh: Terbentuk gas Karbon Dioksida (CO₂), tidak ada endapan"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Kesimpulan */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Kesimpulan Siswa:
            </label>
            <textarea
              rows={3}
              value={record.conclusion}
              onChange={(e) => setRecord({ ...record, conclusion: e.target.value })}
              placeholder="Tuliskan apakah terjadi reaksi kimia atau pelarutan fisik, serta buktinya..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {record.lastUpdated && (
            <div className="text-[11px] text-slate-500 font-mono text-right">
              Terakhir disimpan pukul {record.lastUpdated}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300 font-medium">Hapus catatan?</span>
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Catatan</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tersimpan!</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
