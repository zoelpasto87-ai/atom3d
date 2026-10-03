import React from 'react';
import { ChemicalElement } from '../types/element';
import { calculateAtomicStructure, getShellDetails } from '../utils/chemistry';
import { CATEGORIES } from '../utils/categories';

interface BohrAtomVisualizerProps {
  element: ChemicalElement;
  size?: number;
}

export const BohrAtomVisualizer: React.FC<BohrAtomVisualizerProps> = ({
  element,
  size = 280,
}) => {
  const structure = calculateAtomicStructure(element);
  const shellDetails = getShellDetails(element.electronShells);
  const categoryColor = CATEGORIES[element.category].accentColor;

  const center = size / 2;
  const nucleusRadius = Math.min(24, Math.max(16, 12 + element.period * 1.5));
  const availableRadius = center - nucleusRadius - 14;
  const shellStep = availableRadius / Math.max(element.electronShells.length, 1);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            <radialGradient id="nucleusGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <filter id="valenceGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Electron Orbit Rings */}
          {shellDetails.map((shell, sIdx) => {
            const radius = nucleusRadius + (sIdx + 1) * shellStep;
            const isValence = shell.isValence;

            return (
              <g key={`shell-ring-${sIdx}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={isValence ? categoryColor : '#334155'}
                  strokeWidth={isValence ? 1.6 : 1}
                  strokeDasharray={isValence ? 'none' : '3 3'}
                  className={isValence ? 'opacity-90' : 'opacity-40'}
                />

                {/* Shell letter tag at top of ring */}
                <text
                  x={center}
                  y={center - radius - 3}
                  textAnchor="middle"
                  fill={isValence ? categoryColor : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight={isValence ? 'bold' : 'normal'}
                >
                  {shell.shellLetter} ({shell.electronCount})
                </text>

                {/* Electron dots on this ring */}
                {Array.from({ length: shell.electronCount }).map((_, eIdx) => {
                  const angle = (2 * Math.PI * eIdx) / shell.electronCount - Math.PI / 2;
                  const eX = center + radius * Math.cos(angle);
                  const eY = center + radius * Math.sin(angle);

                  return (
                    <circle
                      key={`electron-${sIdx}-${eIdx}`}
                      cx={eX}
                      cy={eY}
                      r={isValence ? 3.5 : 2.5}
                      fill={isValence ? categoryColor : '#38bdf8'}
                      stroke="#020617"
                      strokeWidth="1"
                      filter={isValence ? 'url(#valenceGlow)' : undefined}
                    >
                      <title>{`Kulit ${shell.shellLetter} - Elektron #${eIdx + 1}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}

          {/* Nucleus (Inti Atom) */}
          <g>
            <circle
              cx={center}
              cy={center}
              r={nucleusRadius}
              fill="url(#nucleusGrad)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              className="drop-shadow-lg shadow-cyan-500/50"
            />
            <text
              x={center}
              y={center - 3}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {element.symbol}
            </text>
            <text
              x={center}
              y={center + 8}
              textAnchor="middle"
              fill="#93c5fd"
              fontSize="7.5"
              fontFamily="monospace"
            >
              {structure.protons}p {structure.neutrons}n
            </text>
          </g>
        </svg>
      </div>

      {/* Legend under Bohr Model */}
      <div className="w-full flex items-center justify-between text-[11px] pt-2 px-1 text-slate-400 border-t border-slate-800/60 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          <span>Kulit Dalam</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="font-semibold text-slate-200">
            Valensi: {element.valenceElectrons ?? '-'} e⁻
          </span>
        </div>
      </div>

      <div className="w-full mt-2 pt-2 border-t border-slate-800/40 text-[9.5px] text-slate-400 leading-tight space-y-1">
        <p>
          <span className="text-amber-400 font-semibold">* Representasi isotop:</span> Inti menampilkan {structure.protons}p dan {structure.neutrons}n (berdasarkan isotop representatif paling umum).
        </p>
        <p className="text-slate-500 italic">
          Model atom pada aplikasi ini merupakan visualisasi pembelajaran untuk membantu memahami struktur atom dan distribusi elektron. Visualisasi ini bukan representasi literal orbital mekanika kuantum.
        </p>
      </div>
    </div>
  );
};
