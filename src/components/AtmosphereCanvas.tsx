/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { SuspensePhase } from '../types';

interface AtmosphereCanvasProps {
  phase: SuspensePhase;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({ phase }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<SuspensePhase>(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Warm embers and bokeh particles
    const particles: Particle[] = [];
    const colors = ['#f5c542', '#ffd700', '#ff9a3c', '#ffea79', '#ffffff'];

    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.7, // gently floating upward
        size: 1.5 + Math.random() * 3.5,
        alpha: Math.random() * 0.6,
        maxAlpha: 0.4 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const sparks: Spark[] = [];

    const spawnSparks = (count: number) => {
      for (let i = 0; i < count; i++) {
        // Spark fountains from left and right stage corners
        const isLeft = Math.random() > 0.5;
        const originX = isLeft ? width * 0.18 : width * 0.82;
        const originY = height * 0.88;
        const angle = isLeft
          ? -Math.PI / 2 + (Math.random() * 0.5 - 0.1)
          : -Math.PI / 2 - (Math.random() * 0.5 - 0.1);
        const speed = 6 + Math.random() * 11;

        sparks.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 30 + Math.random() * 30,
          size: 1.5 + Math.random() * 2.5,
          color: Math.random() > 0.3 ? '#ffe066' : '#ff922b',
        });
      }
    };

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      const currentPhase = phaseRef.current;
      const isSuspense =
        currentPhase === 'fast_spinning' ||
        currentPhase === 'decelerating' ||
        currentPhase === 'charging';

      // If in intense spinning or suspense phase, spawn cold spark fireworks
      if (currentPhase === 'fast_spinning' && tick % 2 === 0) {
        spawnSparks(4);
      } else if (currentPhase === 'decelerating' && tick % 4 === 0) {
        spawnSparks(2);
      }

      // Draw searchlights if in suspense/charging
      if (isSuspense) {
        const time = tick * 0.025;
        const beamAngle1 = Math.sin(time) * 0.35 - 0.3;
        const beamAngle2 = -Math.sin(time * 0.9) * 0.35 + 0.3;

        // Searchlight Left
        ctx.save();
        const gradL = ctx.createRadialGradient(
          width * 0.1,
          height,
          20,
          width * 0.5 + Math.sin(beamAngle1) * width * 0.4,
          height * 0.45,
          width * 0.5
        );
        gradL.addColorStop(0, 'rgba(255, 215, 0, 0.28)');
        gradL.addColorStop(0.5, 'rgba(255, 190, 40, 0.08)');
        gradL.addColorStop(1, 'transparent');
        ctx.fillStyle = gradL;
        ctx.beginPath();
        ctx.moveTo(width * 0.08, height);
        ctx.lineTo(width * 0.12, height);
        ctx.lineTo(width * 0.5 + Math.sin(beamAngle1) * 200 + 120, height * 0.2);
        ctx.lineTo(width * 0.5 + Math.sin(beamAngle1) * 200 - 120, height * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Searchlight Right
        ctx.save();
        const gradR = ctx.createRadialGradient(
          width * 0.9,
          height,
          20,
          width * 0.5 + Math.sin(beamAngle2) * width * 0.4,
          height * 0.45,
          width * 0.5
        );
        gradR.addColorStop(0, 'rgba(255, 230, 100, 0.28)');
        gradR.addColorStop(0.5, 'rgba(255, 180, 30, 0.08)');
        gradR.addColorStop(1, 'transparent');
        ctx.fillStyle = gradR;
        ctx.beginPath();
        ctx.moveTo(width * 0.88, height);
        ctx.lineTo(width * 0.92, height);
        ctx.lineTo(width * 0.5 + Math.sin(beamAngle2) * 200 + 120, height * 0.2);
        ctx.lineTo(width * 0.5 + Math.sin(beamAngle2) * 200 - 120, height * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Draw floating bokeh embers
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha =
          p.maxAlpha * (0.6 + 0.4 * Math.sin(p.pulsePhase));

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw active sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.28; // gravity
        s.vx *= 0.98;
        s.life++;

        const progress = s.life / s.maxLife;
        if (progress >= 1) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = (1 - progress) * 0.9;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  );
};
