import React, { useEffect, useRef } from 'react';
import { Material, VisualEffectType } from '../data/chemistry-lab-data';

interface BeakerVisualizerProps {
  materialA: Material | null;
  materialB: Material | null;
  visualEffect: VisualEffectType | 'none';
  reactionState: 'idle' | 'pouring' | 'mixing' | 'reacting' | 'completed';
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  wobbleSpeed: number;
  wobbleAmp: number;
}

interface DissolvingParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  decayRate: number;
}

export const BeakerVisualizer: React.FC<BeakerVisualizerProps> = ({
  materialA,
  materialB,
  visualEffect,
  reactionState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const crystalsRef = useRef<DissolvingParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize bubbles or crystals based on visual effect
  useEffect(() => {
    if (reactionState === 'reacting' || reactionState === 'completed') {
      if (visualEffect === 'effervescence' || visualEffect === 'citrus_foam') {
        const count = visualEffect === 'citrus_foam' ? 50 : 40;
        bubblesRef.current = Array.from({ length: count }, () => ({
          x: 40 + Math.random() * 140,
          y: 220 + Math.random() * 40,
          radius: 1.5 + Math.random() * 3.5,
          speed: 1.2 + Math.random() * 2.8,
          opacity: 0.4 + Math.random() * 0.6,
          wobbleSpeed: 0.05 + Math.random() * 0.08,
          wobbleAmp: 1.0 + Math.random() * 2.0,
        }));
      } else if (
        visualEffect === 'dissolution_salt' ||
        visualEffect === 'dissolution_sugar'
      ) {
        crystalsRef.current = Array.from({ length: 45 }, () => ({
          x: 50 + Math.random() * 120,
          y: 245 + Math.random() * 15,
          size: 1.5 + Math.random() * 2.5,
          opacity: 0.9,
          decayRate: 0.003 + Math.random() * 0.004,
        }));
      }
    } else if (reactionState === 'idle') {
      bubblesRef.current = [];
      crystalsRef.current = [];
    }
  }, [reactionState, visualEffect]);

  // Main canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const beakerX = 35;
      const beakerY = 40;
      const beakerW = 150;
      const beakerH = 220;
      const cornerR = 18;

      // Determine liquid fill level & color
      let fillPercent = 0;
      let liquidColor = 'rgba(56, 189, 248, 0.25)';
      let hasLiquid = false;

      if (materialA && !materialB) {
        hasLiquid = true;
        fillPercent = 0.42;
        liquidColor = materialA.liquidColor;
      } else if (materialA && materialB) {
        hasLiquid = true;
        fillPercent = reactionState === 'pouring' ? 0.55 : 0.68;
        if (visualEffect === 'citrus_foam') {
          liquidColor = 'rgba(245, 158, 11, 0.55)';
        } else if (visualEffect === 'effervescence') {
          liquidColor = 'rgba(224, 242, 254, 0.45)';
        } else {
          liquidColor = materialA.liquidColor;
        }
      }

      // Draw Beaker Background (Liquid Fill)
      if (hasLiquid) {
        ctx.save();
        // Create clipping region matching inside of beaker
        ctx.beginPath();
        ctx.moveTo(beakerX + 10, beakerY + 10);
        ctx.lineTo(beakerX + 10, beakerY + beakerH - cornerR);
        ctx.quadraticCurveTo(
          beakerX + 10,
          beakerY + beakerH,
          beakerX + 10 + cornerR,
          beakerY + beakerH
        );
        ctx.lineTo(beakerX + beakerW - 10 - cornerR, beakerY + beakerH);
        ctx.quadraticCurveTo(
          beakerX + beakerW - 10,
          beakerY + beakerH,
          beakerX + beakerW - 10,
          beakerY + beakerH - cornerR
        );
        ctx.lineTo(beakerX + beakerW - 10, beakerY + 10);
        ctx.closePath();
        ctx.clip();

        const currentLiquidHeight = (beakerH - 20) * fillPercent;
        const liquidTopY = beakerY + beakerH - currentLiquidHeight;

        // Gradient for liquid body
        const liquidGrad = ctx.createLinearGradient(
          beakerX,
          liquidTopY,
          beakerX + beakerW,
          beakerY + beakerH
        );
        liquidGrad.addColorStop(0, liquidColor);
        liquidGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');

        ctx.fillStyle = liquidGrad;
        ctx.fillRect(
          beakerX,
          liquidTopY,
          beakerW,
          currentLiquidHeight + 20
        );

        // Fluid Surface Meniscus Wave
        ctx.beginPath();
        ctx.moveTo(beakerX + 5, liquidTopY);
        for (let x = beakerX + 5; x <= beakerX + beakerW - 5; x += 5) {
          const waveAmp =
            reactionState === 'reacting'
              ? 2.5
              : reactionState === 'mixing'
              ? 3.5
              : 0.8;
          const y = liquidTopY + Math.sin(time * 3 + x * 0.05) * waveAmp;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Reaction Visual Effects Inside Beaker
        if (
          reactionState === 'reacting' ||
          reactionState === 'completed'
        ) {
          // 1. Gas Bubbles & Foam (Cuka + Soda Kue or Air Jeruk + Soda Kue)
          if (
            visualEffect === 'effervescence' ||
            visualEffect === 'citrus_foam'
          ) {
            // Foam layer on top
            const foamHeight =
              reactionState === 'reacting' ? 24 : 10;
            ctx.fillStyle =
              visualEffect === 'citrus_foam'
                ? 'rgba(254, 240, 138, 0.75)'
                : 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.roundRect(
              beakerX + 12,
              liquidTopY - foamHeight / 2,
              beakerW - 24,
              foamHeight,
              8
            );
            ctx.fill();

            // Rising Carbon Dioxide Gas bubbles
            bubblesRef.current.forEach((b) => {
              b.y -= b.speed;
              b.x += Math.sin(time * 5 + b.y * 0.1) * b.wobbleAmp * 0.15;

              // Reset bubble when reaching top
              if (b.y < liquidTopY) {
                b.y = beakerY + beakerH - 15 - Math.random() * 20;
                b.x = beakerX + 20 + Math.random() * (beakerW - 40);
              }

              ctx.beginPath();
              ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
              ctx.fill();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            });
          }

          // 2. Dissolving Crystals (Garam / Gula in Air)
          if (
            visualEffect === 'dissolution_salt' ||
            visualEffect === 'dissolution_sugar'
          ) {
            crystalsRef.current.forEach((c) => {
              if (reactionState === 'reacting') {
                c.opacity = Math.max(0, c.opacity - c.decayRate);
                c.size = Math.max(0.2, c.size - 0.005);
              }

              if (c.opacity > 0.05) {
                ctx.fillStyle =
                  visualEffect === 'dissolution_salt'
                    ? `rgba(248, 250, 252, ${c.opacity})`
                    : `rgba(254, 240, 138, ${c.opacity})`;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
                ctx.fill();
              }
            });

            // Gentle dissolution shimmer swirls
            if (reactionState === 'reacting') {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(
                beakerX + beakerW / 2,
                liquidTopY + currentLiquidHeight / 2,
                25 + Math.sin(time * 2) * 5,
                0,
                Math.PI * 1.5
              );
              ctx.stroke();
            }
          }
        }

        ctx.restore();
      }

      // Draw Glass Beaker Outline & Reflections
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';

      // Spout on top left
      ctx.beginPath();
      ctx.moveTo(beakerX - 4, beakerY);
      ctx.lineTo(beakerX + 8, beakerY);
      ctx.lineTo(beakerX + 8, beakerY + 12);
      ctx.lineTo(beakerX + 8, beakerY + beakerH - cornerR);
      ctx.quadraticCurveTo(
        beakerX + 8,
        beakerY + beakerH,
        beakerX + 8 + cornerR,
        beakerY + beakerH
      );
      ctx.lineTo(beakerX + beakerW - 8 - cornerR, beakerY + beakerH);
      ctx.quadraticCurveTo(
        beakerX + beakerW - 8,
        beakerY + beakerH,
        beakerX + beakerW - 8,
        beakerY + beakerH - cornerR
      );
      ctx.lineTo(beakerX + beakerW - 8, beakerY);
      ctx.lineTo(beakerX + beakerW + 4, beakerY);
      ctx.stroke();

      // Glass Edge Highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(beakerX + 14, beakerY + 15);
      ctx.lineTo(beakerX + 14, beakerY + beakerH - 25);
      ctx.stroke();

      // Measurement Markings (50mL, 100mL, 150mL, 200mL, 250mL)
      const marks = [
        { ml: '50', y: beakerY + beakerH - 45 },
        { ml: '100', y: beakerY + beakerH - 85 },
        { ml: '150', y: beakerY + beakerH - 125 },
        { ml: '200', y: beakerY + beakerH - 165 },
        { ml: '250', y: beakerY + beakerH - 200 },
      ];

      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';

      marks.forEach((m) => {
        ctx.beginPath();
        ctx.moveTo(beakerX + beakerW - 24, m.y);
        ctx.lineTo(beakerX + beakerW - 10, m.y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillText(`${m.ml} mL`, beakerX + beakerW - 28, m.y + 3);
      });

      // Beaker Label "PYREX 250ml"
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.fillText('LAB BOROSILICATE', beakerX + beakerW / 2, beakerY + 28);
      ctx.fillText('MAX 250 mL', beakerX + beakerW / 2, beakerY + 38);

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [materialA, materialB, visualEffect, reactionState]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      <div className="relative w-[220px] h-[280px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={220}
          height={280}
          className="w-full h-full drop-shadow-[0_15px_35px_rgba(34,211,238,0.15)]"
        />

        {/* Reaction Status Overlay Pill */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none">
          {reactionState === 'reacting' && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold animate-pulse shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Reaksi Berlangsung...</span>
            </div>
          )}
          {reactionState === 'mixing' && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold shadow-lg">
              <span>Bahan Bercampur</span>
            </div>
          )}
          {reactionState === 'completed' && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold shadow-lg">
              <span>Pengamatan Selesai</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
