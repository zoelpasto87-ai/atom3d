import React from 'react';
import { ChemicalElement } from '../types/element';
import { CATEGORIES } from '../utils/categories';
import { formatAtomicMass } from '../utils/chemistry';
import {
  TRENDS_DATA_BY_NUMBER,
  PERIODIC_PROPERTIES,
} from '../data/periodic-trends-data';
import {
  Scale,
  ArrowLeft,
  RotateCcw,
  Atom,
  TrendingUp,
  Sparkles,
  Info,
  CircleDot,
  Zap,
  Magnet,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface CompareThreeElementsProps {
  elements: [ChemicalElement, ChemicalElement, ChemicalElement] | ChemicalElement[];
  onBack: () => void;
  onResetSelection: () => void;
  onOpenAtom3D: (element: ChemicalElement) => void;
}

export const CompareThreeElements: React.FC<CompareThreeElementsProps> = ({
  elements,
  onBack,
  onResetSelection,
  onOpenAtom3D,
}) => {
  // Ensure we have exactly 3 elements
  if (!elements || elements.length < 3) {
    return (
      <div className="p-8 text-center bg-slate-900/80 rounded-3xl border border-slate-800">
        <Scale className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Pilih 3 Unsur Terlebih Dahulu</h3>
        <p className="text-sm text-slate-400 mb-4">
          Anda perlu memilih tepat 3 unsur dari tabel periodik untuk melakukan perbandingan berdampingan.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm cursor-pointer"
        >
          Kembali ke Tabel
        </button>
      </div>
    );
  }

  const [el1, el2, el3] = [elements[0], elements[1], elements[2]];
  const trend1 = TRENDS_DATA_BY_NUMBER[el1.atomicNumber];
  const trend2 = TRENDS_DATA_BY_NUMBER[el2.atomicNumber];
  const trend3 = TRENDS_DATA_BY_NUMBER[el3.atomicNumber];

  const cat1 = CATEGORIES[el1.category];
  const cat2 = CATEGORIES[el2.category];
  const cat3 = CATEGORIES[el3.category];

  // Helper to determine min/max highlight for numerical rows
  const getRankBadge = (val1: number | null | undefined, val2: number | null | undefined, val3: number | null | undefined, currentVal: number | null | undefined) => {
    if (currentVal === null || currentVal === undefined || isNaN(currentVal)) {
      return null;
    }
    const valid = [val1, val2, val3].filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (valid.length < 2) return null;

    const max = Math.max(...valid);
    const min = Math.min(...valid);

    if (currentVal === max && max !== min) {
      return (
        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
          Tertinggi
        </span>
      );
    }
    if (currentVal === min && max !== min) {
      return (
        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/50">
          Terendah
        </span>
      );
    }
    return null;
  };

  // Group / Period insight check
  const samePeriod = el1.period === el2.period && el2.period === el3.period;
  const sameGroup = el1.group !== null && el1.group === el2.group && el2.group === el3.group;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Sifat Keperiodikan</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>PERBANDINGAN 3 UNSUR</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold">
                Tri-Element
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Analisis komparatif sifat atomik dan periodisitas ({el1.symbol} vs {el2.symbol} vs {el3.symbol})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetSelection}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer"
            title="Pilih 3 unsur yang berbeda"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ubah Pilihan Unsur</span>
          </button>
        </div>
      </div>

      {/* 3 Main Element Highlight Cards (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { el: el1, cat: cat1, trend: trend1, pos: 1 },
          { el: el2, cat: cat2, trend: trend2, pos: 2 },
          { el: el3, cat: cat3, trend: trend3, pos: 3 },
        ].map(({ el, cat, pos }) => (
          <div
            key={el.atomicNumber}
            className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-xl overflow-hidden group hover:border-slate-700 transition-all"
          >
            {/* Top order tag & atomic number */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unsur #{pos}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Z = {el.atomicNumber}
              </span>
            </div>

            {/* Huge Element Symbol & Name */}
            <div className="text-center py-3">
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex flex-col items-center justify-center font-black border shadow-lg mb-2.5 transition-transform group-hover:scale-105"
                style={{
                  borderColor: cat.accentColor,
                  backgroundColor: '#020617',
                  boxShadow: `0 0 24px ${cat.accentColor}20`,
                }}
              >
                <span className="text-3xl sm:text-4xl font-black text-white leading-none">
                  {el.symbol}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  {formatAtomicMass(el.atomicMass)}
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">{el.name}</h3>
              {el.latinName && (
                <p className="text-xs text-slate-400 italic">({el.latinName})</p>
              )}
            </div>

            {/* Essential Periodic Position Stats */}
            <div className="grid grid-cols-2 gap-2 my-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Golongan</span>
                <span className="font-bold text-slate-200">
                  {el.group !== null ? `Golongan ${el.group}` : 'Lantanida/Aktinida'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Periode</span>
                <span className="font-bold text-slate-200">Periode {el.period}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Blok</span>
                <span className="font-bold text-cyan-300 font-mono">Blok {el.block.toUpperCase()}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Wujud</span>
                <span className="font-bold text-slate-200">{el.state}</span>
              </div>
            </div>

            {/* Category badge */}
            <div className="my-2 text-center">
              <span
                className="inline-block text-[11px] font-bold px-3 py-1 rounded-full border"
                style={{
                  borderColor: `${cat.accentColor}60`,
                  backgroundColor: `${cat.accentColor}15`,
                  color: cat.accentColor,
                }}
              >
                {el.category}
              </span>
            </div>

            {/* Button to open Atom 3D */}
            <button
              type="button"
              onClick={() => onOpenAtom3D(el)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Atom className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lihat Model 3D {el.symbol}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table Section */}
      <section className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Tabel Perbandingan Sifat Atom
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Nilai numerik terstandarisasi (NIST & RSC)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase font-mono tracking-wider">
                <th className="p-3 sm:p-4 font-bold text-slate-300 w-1/4">Sifat Atomik</th>
                <th className="p-3 sm:p-4 font-bold text-cyan-300 w-1/4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{el1.symbol} — {el1.name}</span>
                  </div>
                </th>
                <th className="p-3 sm:p-4 font-bold text-amber-300 w-1/4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{el2.symbol} — {el2.name}</span>
                  </div>
                </th>
                <th className="p-3 sm:p-4 font-bold text-emerald-300 w-1/4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{el3.symbol} — {el3.name}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {/* 1. Nomor Atom */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-400 flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nomor Atom (Z)</span>
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold text-white">
                  {el1.atomicNumber}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold text-white">
                  {el2.atomicNumber}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold text-white">
                  {el3.atomicNumber}
                </td>
              </tr>

              {/* 2. Massa Atom */}
              <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                <td className="p-3 sm:p-4 font-bold text-slate-400">Massa Atom Standar</td>
                <td className="p-3 sm:p-4 font-mono">
                  {formatAtomicMass(el1.atomicMass)} u
                </td>
                <td className="p-3 sm:p-4 font-mono">
                  {formatAtomicMass(el2.atomicMass)} u
                </td>
                <td className="p-3 sm:p-4 font-mono">
                  {formatAtomicMass(el3.atomicMass)} u
                </td>
              </tr>

              {/* 3. Jari-jari Atom */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-400">
                  <div>
                    <span className="text-white font-bold">Jari-jari Atom</span>
                    <span className="text-[10px] text-slate-500 block">Non-bonded (van der Waals)</span>
                  </div>
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend1?.atomicRadius ? `${trend1.atomicRadius.toFixed(2)} Å` : '—'}
                  {getRankBadge(trend1?.atomicRadius, trend2?.atomicRadius, trend3?.atomicRadius, trend1?.atomicRadius)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend2?.atomicRadius ? `${trend2.atomicRadius.toFixed(2)} Å` : '—'}
                  {getRankBadge(trend1?.atomicRadius, trend2?.atomicRadius, trend3?.atomicRadius, trend2?.atomicRadius)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend3?.atomicRadius ? `${trend3.atomicRadius.toFixed(2)} Å` : '—'}
                  {getRankBadge(trend1?.atomicRadius, trend2?.atomicRadius, trend3?.atomicRadius, trend3?.atomicRadius)}
                </td>
              </tr>

              {/* 4. Energi Ionisasi Pertama */}
              <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                <td className="p-3 sm:p-4 font-bold text-slate-400">
                  <div>
                    <span className="text-white font-bold">Energi Ionisasi Pertama</span>
                    <span className="text-[10px] text-slate-500 block">Energi pelepasan elektron 1 (EI₁)</span>
                  </div>
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend1?.ionizationEnergy ? `${trend1.ionizationEnergy.toFixed(1)} kJ/mol` : '—'}
                  {getRankBadge(trend1?.ionizationEnergy, trend2?.ionizationEnergy, trend3?.ionizationEnergy, trend1?.ionizationEnergy)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend2?.ionizationEnergy ? `${trend2.ionizationEnergy.toFixed(1)} kJ/mol` : '—'}
                  {getRankBadge(trend1?.ionizationEnergy, trend2?.ionizationEnergy, trend3?.ionizationEnergy, trend2?.ionizationEnergy)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend3?.ionizationEnergy ? `${trend3.ionizationEnergy.toFixed(1)} kJ/mol` : '—'}
                  {getRankBadge(trend1?.ionizationEnergy, trend2?.ionizationEnergy, trend3?.ionizationEnergy, trend3?.ionizationEnergy)}
                </td>
              </tr>

              {/* 5. Elektronegativitas */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-400">
                  <div>
                    <span className="text-white font-bold">Elektronegativitas</span>
                    <span className="text-[10px] text-slate-500 block">Skala Pauling</span>
                  </div>
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend1?.electronegativity !== null && trend1?.electronegativity !== undefined
                    ? trend1.electronegativity.toFixed(2)
                    : '—'}
                  {getRankBadge(trend1?.electronegativity, trend2?.electronegativity, trend3?.electronegativity, trend1?.electronegativity)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend2?.electronegativity !== null && trend2?.electronegativity !== undefined
                    ? trend2.electronegativity.toFixed(2)
                    : '—'}
                  {getRankBadge(trend1?.electronegativity, trend2?.electronegativity, trend3?.electronegativity, trend2?.electronegativity)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend3?.electronegativity !== null && trend3?.electronegativity !== undefined
                    ? trend3.electronegativity.toFixed(2)
                    : '—'}
                  {getRankBadge(trend1?.electronegativity, trend2?.electronegativity, trend3?.electronegativity, trend3?.electronegativity)}
                </td>
              </tr>

              {/* 6. Afinitas Elektron */}
              <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                <td className="p-3 sm:p-4 font-bold text-slate-400">
                  <div>
                    <span className="text-white font-bold">Afinitas Elektron</span>
                    <span className="text-[10px] text-slate-500 block">Energi penerimaan elektron (kJ/mol)</span>
                  </div>
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend1?.electronAffinity !== null && trend1?.electronAffinity !== undefined
                    ? `${trend1.electronAffinity.toFixed(1)} kJ/mol`
                    : '—'}
                  {getRankBadge(trend1?.electronAffinity, trend2?.electronAffinity, trend3?.electronAffinity, trend1?.electronAffinity)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend2?.electronAffinity !== null && trend2?.electronAffinity !== undefined
                    ? `${trend2.electronAffinity.toFixed(1)} kJ/mol`
                    : '—'}
                  {getRankBadge(trend1?.electronAffinity, trend2?.electronAffinity, trend3?.electronAffinity, trend2?.electronAffinity)}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {trend3?.electronAffinity !== null && trend3?.electronAffinity !== undefined
                    ? `${trend3.electronAffinity.toFixed(1)} kJ/mol`
                    : '—'}
                  {getRankBadge(trend1?.electronAffinity, trend2?.electronAffinity, trend3?.electronAffinity, trend3?.electronAffinity)}
                </td>
              </tr>

              {/* 7. Elektron Valensi */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-400">Elektron Valensi</td>
                <td className="p-3 sm:p-4 font-mono font-bold text-cyan-300">
                  {el1.valenceElectrons !== null ? el1.valenceElectrons : '—'}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold text-amber-300">
                  {el2.valenceElectrons !== null ? el2.valenceElectrons : '—'}
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold text-emerald-300">
                  {el3.valenceElectrons !== null ? el3.valenceElectrons : '—'}
                </td>
              </tr>

              {/* 8. Jumlah Kulit Utama */}
              <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                <td className="p-3 sm:p-4 font-bold text-slate-400">Jumlah Kulit Elektron (n)</td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {el1.electronShells.length} Kulit (n = {el1.period})
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {el2.electronShells.length} Kulit (n = {el2.period})
                </td>
                <td className="p-3 sm:p-4 font-mono font-bold">
                  {el3.electronShells.length} Kulit (n = {el3.period})
                </td>
              </tr>

              {/* 9. Konfigurasi Elektron */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-400">Konfigurasi Elektron (Subkulit)</td>
                <td className="p-3 sm:p-4 font-mono text-cyan-300 text-xs">
                  {el1.electronConfiguration}
                </td>
                <td className="p-3 sm:p-4 font-mono text-amber-300 text-xs">
                  {el2.electronConfiguration}
                </td>
                <td className="p-3 sm:p-4 font-mono text-emerald-300 text-xs">
                  {el3.electronConfiguration}
                </td>
              </tr>

              {/* 10. Susunan Kulit Bohr */}
              <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                <td className="p-3 sm:p-4 font-bold text-slate-400">Distribusi Kulit Bohr (K, L, M...)</td>
                <td className="p-3 sm:p-4 font-mono text-slate-300">
                  {el1.electronShells.join(', ')}
                </td>
                <td className="p-3 sm:p-4 font-mono text-slate-300">
                  {el2.electronShells.join(', ')}
                </td>
                <td className="p-3 sm:p-4 font-mono text-slate-300">
                  {el3.electronShells.join(', ')}
                </td>
              </tr>

              {/* 11. Bilangan Oksidasi */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-400">Bilangan Oksidasi Umum</td>
                <td className="p-3 sm:p-4 font-mono text-slate-300">
                  {el1.oxidationStates || '0'}
                </td>
                <td className="p-3 sm:p-4 font-mono text-slate-300">
                  {el2.oxidationStates || '0'}
                </td>
                <td className="p-3 sm:p-4 font-mono text-slate-300">
                  {el3.oxidationStates || '0'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Educational Analysis & Periodic Law Insights */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm sm:text-base font-extrabold text-white">
            Analisis Hukum Keperiodikan Tiga Unsur
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hubungan Posisi dalam Tabel Periodik</span>
            </span>
            <p>
              {samePeriod ? (
                <>
                  Ketiga unsur ini ({el1.symbol}, {el2.symbol}, {el3.symbol}) berada dalam <strong>Periode {el1.period}</strong> yang sama. 
                  Dalam satu periode dari kiri ke kanan, muatan inti efektif (Z_eff) meningkat sementara jumlah kulit elektron tetap sama ({el1.electronShells.length} kulit).
                </>
              ) : sameGroup ? (
                <>
                  Ketiga unsur ini ({el1.symbol}, {el2.symbol}, {el3.symbol}) berada dalam <strong>Golongan {el1.group}</strong> yang sama. 
                  Dalam satu golongan dari atas ke bawah, jumlah kulit elektron bertambah sehingga efek perisai elektron (shielding effect) semakin besar.
                </>
              ) : (
                <>
                  Unsur-unsur ini berasal dari periode dan golongan yang berbeda: <strong>{el1.symbol}</strong> (Per. {el1.period}, Gol. {el1.group ?? 'f'}), <strong>{el2.symbol}</strong> (Per. {el2.period}, Gol. {el2.group ?? 'f'}), dan <strong>{el3.symbol}</strong> (Per. {el3.period}, Gol. {el3.group ?? 'f'}). Hal ini memungkinkan perbandingan lintas blok dan tingkat energi.
                </>
              )}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Karakter Ikatan & Kecenderungan Reaksi</span>
            </span>
            <p>
              Perbedaan elektronegativitas antara unsur terendah dan tertinggi menentukan jenis ikatan yang dapat terbentuk saat bereaksi. 
              Unsur dengan elektron valensi rendah ({el1.valenceElectrons ?? '—'}, {el2.valenceElectrons ?? '—'}) cenderung melepaskan elektron membentuk kation (logam), 
              sedangkan unsur dengan elektron valensi tinggi mendekati oktet cenderung menarik elektron membentuk anion (nonlogam).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
