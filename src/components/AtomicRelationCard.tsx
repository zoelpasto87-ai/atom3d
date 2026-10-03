import React from 'react';
import { ChemicalElement } from '../types/element';
import { ArrowDown, CheckCircle2, Zap } from 'lucide-react';
import { CATEGORIES } from '../utils/categories';

interface AtomicRelationCardProps {
  element: ChemicalElement;
}

export const AtomicRelationCard: React.FC<AtomicRelationCardProps> = ({ element }) => {
  const catInfo = CATEGORIES[element.category];

  const steps = [
    {
      title: 'Nomor Atom (Z)',
      value: `Z = ${element.atomicNumber}`,
      desc: 'Menentukan identitas khas unsur dalam sistem periodik.',
      accent: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
    },
    {
      title: 'Jumlah Proton (p⁺)',
      value: `${element.atomicNumber} Proton`,
      desc: 'Muatan positif di inti atom yang menarik elektron.',
      accent: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
    },
    {
      title: 'Jumlah Elektron (e⁻)',
      value: `${element.atomicNumber} Elektron`,
      desc: 'Atom netral: jumlah elektron persis sama dengan proton.',
      accent: 'border-teal-500/40 bg-teal-950/20 text-teal-300',
    },
    {
      title: 'Konfigurasi Elektron',
      value: element.electronConfiguration,
      desc: `Terdistribusi dalam kulit [${element.electronShells.join(', ')}] (blok ${element.block}).`,
      accent: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300',
    },
    {
      title: 'Elektron Valensi',
      value: `${element.valenceElectrons ?? '?'} elektron terluar`,
      desc: `Menempati kulit terluar (Golongan ${element.group ?? 'Lantanida/Aktinida'}, Periode ${element.period}).`,
      accent: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    },
    {
      title: 'Sifat Kimia & Kereaktifan',
      value: `${element.category} (${element.state})`,
      desc: element.reactivitySummary || `Kereaktifan dipengaruhi oleh kemudahan mencapai konfigurasi oktet/duplet stabil.`,
      accent: `border-rose-500/40 bg-rose-950/20 text-rose-300`,
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Hubungan Atom & Sifat Kimia</h4>
            <p className="text-[11px] text-slate-400">
              Alur kausalitas dari nomor atom menuju sifat periodik unsur
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Modul Edukasi
        </span>
      </div>

      {/* Flowchart Steps */}
      <div className="space-y-1.5">
        {steps.map((step, idx) => (
          <React.Fragment key={step.title}>
            <div
              className={`p-2.5 rounded-xl border transition-all ${step.accent} flex items-start justify-between gap-3`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300/90 font-mono pl-6 font-medium">
                  {step.value}
                </p>
                <p className="text-[10.5px] text-slate-400 pl-6">
                  {step.desc}
                </p>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 opacity-40 text-slate-400 mt-1" />
            </div>

            {idx < steps.length - 1 && (
              <div className="flex justify-center -my-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400/60" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Insight footer */}
      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl">
        <strong className="text-cyan-300">Kesimpulan Ilmiah: </strong>
        Semua sifat kimia unsur <span className="text-white font-semibold">{element.name} ({element.symbol})</span>, seperti bilangan oksidasi (<span className="text-amber-300 font-mono">{element.oxidationStates}</span>) dan kecenderungan berikatan, berakar langsung dari jumlah muatan inti ({element.atomicNumber} p⁺) dan susunan {element.valenceElectrons ?? 0} elektron valensinya!
      </div>
    </div>
  );
};
