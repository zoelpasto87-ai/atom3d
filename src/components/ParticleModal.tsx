import React, { useEffect, useRef } from 'react';
import { Experiment } from '../data/chemistry-lab-data';
import { X, Sparkles, Layers, Info } from 'lucide-react';

interface ParticleModalProps {
  experiment: Experiment;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label: string;
  textColor?: string;
  isGas?: boolean;
}

export const ParticleModal: React.FC<ParticleModalProps> = ({
  experiment,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const width = canvas.width;
    const height = canvas.height;

    // Generate particles depending on experiment
    if (experiment.id === 'air_garam') {
      // NaCl dissolution: Na+ and Cl- ions + H2O molecules
      for (let i = 0; i < 14; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: 12,
          color: '#a855f7', // Purple for Na+
          label: 'Na⁺',
          textColor: '#ffffff',
        });
      }
      for (let i = 0; i < 14; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: 16,
          color: '#10b981', // Emerald for Cl-
          label: 'Cl⁻',
          textColor: '#ffffff',
        });
      }
      for (let i = 0; i < 22; i++) {
        particles.push({
          x: 30 + Math.random() * (width - 60),
          y: 30 + Math.random() * (height - 60),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: 7,
          color: '#38bdf8', // Blue for H2O
          label: 'H₂O',
          textColor: '#0f172a',
        });
      }
    } else if (
      experiment.id === 'cuka_soda_kue' ||
      experiment.id === 'air_jeruk_soda_kue'
    ) {
      // Effervescence: CO2 gas bubbles rising, Na+ and acetate/citrate ions in solution
      for (let i = 0; i < 16; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: height / 2 + Math.random() * (height / 2 - 40),
          vx: (Math.random() - 0.5) * 0.9,
          vy: -1.2 - Math.random() * 1.5, // Moving up as gas
          radius: 13,
          color: '#f43f5e', // Red-Rose for CO2
          label: 'CO₂',
          textColor: '#ffffff',
          isGas: true,
        });
      }
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: 50 + Math.random() * (height - 100),
          vx: (Math.random() - 0.5) * 0.9,
          vy: (Math.random() - 0.5) * 0.9,
          radius: 11,
          color: '#a855f7',
          label: 'Na⁺',
          textColor: '#ffffff',
        });
      }
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: 50 + Math.random() * (height - 100),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: 17,
          color: '#f59e0b',
          label: experiment.id === 'cuka_soda_kue' ? 'Ac⁻' : 'Cit³⁻',
          textColor: '#0f172a',
        });
      }
    } else {
      // Sugar or general dissolution
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: 20,
          color: '#fbbf24',
          label: 'Sukrosa',
          textColor: '#0f172a',
        });
      }
      for (let i = 0; i < 24; i++) {
        particles.push({
          x: 30 + Math.random() * (width - 60),
          y: 30 + Math.random() * (height - 60),
          vx: (Math.random() - 0.5) * 0.9,
          vy: (Math.random() - 0.5) * 0.9,
          radius: 7,
          color: '#38bdf8',
          label: 'H₂O',
          textColor: '#0f172a',
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Liquid background container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(0, 0, width, height);

      // Divider line for liquid-gas surface if CO2
      if (
        experiment.id === 'cuka_soda_kue' ||
        experiment.id === 'air_jeruk_soda_kue'
      ) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(0, 70);
        ctx.lineTo(width, 70);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('Fase Gas (Udara)', 10, 35);
        ctx.fillText('Fase Larutan (Cairan)', 10, 90);
      }

      // Update & draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x - p.radius < 0 || p.x + p.radius > width) {
          p.vx *= -1;
        }
        if (p.isGas) {
          if (p.y - p.radius < 10) {
            // Loop back to bottom
            p.y = height - 20;
            p.x = 40 + Math.random() * (width - 80);
          }
        } else {
          if (p.y - p.radius < 15 || p.y + p.radius > height - 15) {
            p.vy *= -1;
          }
        }

        // Draw particle sphere
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = p.textColor || '#ffffff';
        ctx.font = `bold ${Math.max(8, p.radius * 0.75)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, p.x, p.y);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [experiment]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Visualisasi Partikel Konseptual
              </h3>
              <p className="text-xs text-slate-400">{experiment.title}</p>
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

        {/* Canvas Body */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={460}
              height={260}
              className="w-full h-auto max-h-[260px]"
            />
          </div>

          {/* Particle Legend */}
          <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-slate-300">
            {experiment.id === 'air_garam' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Kation Na⁺ (Natrium)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Anion Cl⁻ (Klorida)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>Pelarut H₂O (Air)</span>
                </div>
              </>
            )}
            {(experiment.id === 'cuka_soda_kue' ||
              experiment.id === 'air_jeruk_soda_kue') && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Molekul Gas CO₂</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Kation Na⁺</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Ion Asetat / Sitrat</span>
                </div>
              </>
            )}
            {experiment.id === 'air_gula' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                  <span>Molekul Sukrosa (C₁₂H₂₂O₁₁)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>Pelarut H₂O (Air)</span>
                </div>
              </>
            )}
          </div>

          {/* Microscopic Explanation */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300 block mb-1">
              Mekanisme Submikroskopik:
            </strong>
            {experiment.particleNotes}
          </div>

          {/* Pedagogical Label Requirement */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Visualisasi konseptual:</strong> Model ini disederhanakan
              untuk memudahkan pemahaman interaksi antar ion dan molekul, bukan
              representasi matematis mekanika kuantum skala nyata.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Tutup Visualisasi
          </button>
        </div>
      </div>
    </div>
  );
};
