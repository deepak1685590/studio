"use client";

import React, { useRef, useEffect } from 'react';

// Simplified SVG path data for logos
const LOGO_PATHS = {
  BTC: 'M40,5 L50,5 L50,15 L60,15 L60,25 L50,25 L50,35 L40,35 M40,45 L50,45 L50,55 L60,55 L60,65 L50,65 L50,75 L40,75 M40,5 L40,35 M60,15 L60,25 M60,55 L60,65', // Stylized B
  ETH: 'M50,5 L20,40 L50,60 L80,40 Z M50,5 L50,60 M20,40 L80,40', // Diamond shape
  LTC: 'M30,20 L50,5 L70,20 L50,40 Z', // Simple L shape could be M40 10 L40 70 L70 70
};

type LogoPaths = keyof typeof LOGO_PATHS;

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

    const logoKeys = Object.keys(LOGO_PATHS) as LogoPaths[];
    const compiledPaths = logoKeys.map(key => new Path2D(LOGO_PATHS[key]));

    const fontSize = 20; // Increased size for logos
    const columns = Math.floor(canvas.width / fontSize);

    const rainDrops: { y: number; logoIndex: number; color: string }[] = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = {
        y: 1,
        logoIndex: Math.floor(Math.random() * compiledPaths.length),
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
      };
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < rainDrops.length; i++) {
        const drop = rainDrops[i];
        const path = compiledPaths[drop.logoIndex];
        
        ctx.save();
        
        ctx.strokeStyle = drop.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 5;
        ctx.shadowColor = drop.color;
        
        // Translate to the drop's position
        ctx.translate(i * fontSize, drop.y * fontSize);
        // Scale the logo to fit within the font size
        const scale = fontSize / 100; 
        ctx.scale(scale, scale);
        
        ctx.stroke(path);
        
        ctx.restore();

        if (drop.y * fontSize > canvas.height && Math.random() > 0.975) {
          drop.y = 0;
          drop.logoIndex = Math.floor(Math.random() * compiledPaths.length);
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
