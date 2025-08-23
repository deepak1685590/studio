"use client";

import React, { useRef, useEffect } from 'react';

const SYMBOLS = ['$', '€', '£', '¥'];
const NEON_COLORS = ['#00E6E6', '#8A2BE2', '#007BFF', '#FF00FF'];

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 20;
    ctx.font = `${fontSize}px monospace`;
    const columns = Math.floor(canvas.width / fontSize);

    const rainDrops: { y: number; symbol: string; color: string }[] = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = {
        y: 1,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
      };
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < rainDrops.length; i++) {
        const drop = rainDrops[i];
        
        ctx.fillStyle = drop.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = drop.color;
        
        ctx.fillText(drop.symbol, i * fontSize, drop.y * fontSize);
        
        // Reset shadow for the next character to avoid artifacts
        ctx.shadowBlur = 0;

        if (drop.y * fontSize > canvas.height && Math.random() > 0.975) {
          drop.y = 0;
          drop.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          drop.color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        }
        drop.y++;
      }
      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="matrix-bg" className="fixed top-0 left-0 w-full h-full -z-10 opacity-40" />;
};

export default MatrixBackground;
