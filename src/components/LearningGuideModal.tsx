import React from 'react';
import { X, BookOpen, Atom, Zap, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface LearningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningGuideModal: React.FC<LearningGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const topics = [
    {
      title: '1. Nomor Atom (Z) & Nomor Massa (A)',
      icon: <Atom className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Nomor Atom (Z):</strong> Menunjukkan jumlah{' '}
            <span className="text-cyan-300 font-semibold">proton</span> di dalam inti atom. Pada atom netral, jumlah proton selalu sama persis dengan jumlah <span className="text-teal-300 font-semibold">elektron</span>.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-center text-cyan-300">
            Z = Jumlah Proton = Jumlah Elektron (atom netral)
          </div>
          <p>
            <strong className="text-white">Nomor Massa (A):</strong> Merupakan jumlah total{' '}
            <span className="text-rose-300 font-semibold">proton</span> ditambah{' '}
            <span className="text-amber-300 font-semibold">neutron</span> di inti atom:
          </p>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-center text-slate-300">
            A = Proton + Neutron ➔ Neutron = A - Z
          </div>
        </div>
      ),
    },
    {
      title: '2. Kulit Atom Bohr & Rumus 2n²',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Berdasarkan model atom Niels Bohr, elektron beredar mengelilingi inti atom pada lintasan stasioner yang disebut <strong className="text-white">Kulit Atom</strong> (diberi lambang K, L, M, N, O, P, Q).
          </p>
          <p>
            Kapasitas maksimum elektron pada tiap kulit utama dihitung dengan rumus:{' '}
            <span className="font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              Maksimum = 2n²
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs text-center">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Kulit K (n=1)</span>
              <span className="text-cyan-300 font-bold">Maks. 2 e⁻</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Kulit L (n=2)</span>
              <span className="text-cyan-300 font-bold">Maks. 8 e⁻</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Kulit M (n=3)</span>
              <span className="text-cyan-300 font-bold">Maks. 18 e⁻</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Kulit N (n=4)</span>
              <span className="text-cyan-300 font-bold">Maks. 32 e⁻</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '3. Konfigurasi Elektron (Aturan Aufbau, Hund & Pauli)',
      icon: <Sparkles className="w-5 h-5 text-teal-400" />,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Konfigurasi elektron mekanika kuantum menyatakan susunan persebaran elektron pada subkulit (s, p, d, f):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li>
              <strong className="text-teal-300">Prinsip Aufbau:</strong> Elektron mengisi orbital dari tingkat energi terendah ke tertinggi (1s ➔ 2s ➔ 2p ➔ 3s ➔ 3p ➔ 4s ➔ 3d ...).
            </li>
            <li>
              <strong className="text-teal-300">Kaidah Hund:</strong> Pada orbital setingkat, elektron tidak berpasangan terlebih dahulu sebelum seluruh orbital terisi satu elektron dengan spin sejajar.
            </li>
            <li>
              <strong className="text-teal-300">Larangan Pauli:</strong> Tidak ada dua elektron dalam satu atom yang memiliki keempat bilangan kuantum yang sama.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: '4. Elektron Valensi & Penentuan Golongan',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-amber-300">Elektron Valensi</strong> adalah elektron yang berada pada kulit terluar atom. Elektron inilah yang terlibat langsung dalam reaksi kimia dan pembentukan ikatan.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Golongan Utama (A):</strong> Nomor Golongan = Jumlah Elektron Valensi.
              </span>
            </div>
            <div className="text-xs text-slate-400 pl-6">
              Contoh: Natrium (Na: 2, 8, 1) punya 1 elektron valensi ➔ Golongan IA.
            </div>
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Golongan Transisi (B / Blok d):</strong> Elektron valensi berada pada orbital (n-1)d dan ns.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '5. Periode & Jumlah Kulit Utama',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Baris horizontal dalam tabel periodik disebut <strong className="text-indigo-300">Periode</strong>.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-center text-indigo-300">
            Nomor Periode = Jumlah Kulit Utama yang Terisi Elektron (n terbesar)
          </div>
          <p className="text-xs text-slate-400">
            Contoh: Besi (Fe) memiliki konfigurasi terluar 4s² ➔ Kulit terbesar n=4, maka Besi berada pada <strong>Periode 4</strong>.
          </p>
        </div>
      ),
    },
    {
      title: '6. Sifat Keperiodikan Unsur Kimia',
      icon: <BookOpen className="w-5 h-5 text-rose-400" />,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 block mb-1">Jari-Jari Atom</span>
              <p className="text-slate-400">
                Dalam satu periode (kiri ke kanan) makin mengecil. Dalam satu golongan (atas ke bawah) makin membesar karena jumlah kulit bertambah.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-teal-400 block mb-1">Energi Ionisasi</span>
              <p className="text-slate-400">
                Energi minimum untuk melepas 1 elektron terluar. Kiri ke kanan cenderung membesar, atas ke bawah cenderung mengecil.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Keelektronegatifan</span>
              <p className="text-slate-400">
                Kecenderungan atom menarik pasangan elektron ikatan. Unsur paling elektronegatif adalah Fluor (F = 3.98).
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Kaidah Oktet & Duplet</span>
              <p className="text-slate-400">
                Atom-atom cenderung berikatan untuk mencapai susunan 8 elektron valensi (oktet) atau 2 elektron (duplet) seperti Gas Mulia.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Mode Belajar Kimia SMA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ATOM 3D
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Konsep fundamental struktur atom, konfigurasi elektron, dan tabel periodik modern
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup jendela belajar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {topics.map((t) => (
            <div
              key={t.title}
              className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                {t.icon}
                <h4 className="text-sm font-bold text-white">{t.title}</h4>
              </div>
              <div>{t.content}</div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>ATOM 3D • Media Pembelajaran Kimia Interaktif</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Mengerti, Kembali ke Tabel
          </button>
        </div>
      </div>
    </div>
  );
};
