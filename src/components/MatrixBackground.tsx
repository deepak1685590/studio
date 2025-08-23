"use client";

import React, { useRef, useEffect } from 'react';

// Simplified SVG path data for logos
const LOGO_PATHS = {
  BTC: 'M40,5 L50,5 L50,15 L60,15 L60,25 L50,25 L50,35 L40,35 M40,45 L50,45 L50,55 L60,55 L60,65 L50,65 L50,75 L40,75 M40,5 L40,35 M60,15 L60,25 M60,55 L60,65', // Stylized B
  ETH: 'M50,5 L20,40 L50,60 L80,40 Z M50,5 L50,60 M20,40 L80,40', // Diamond shape
  LTC: 'M30,20 L50,5 L70,20 L50,40 Z', // Simple L shape could be M40 10 L40 70 L70 70
};

type LogoPaths = keyof typeof LOGO_PATHS;

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

    const rainDrops: { y: number; logoIndex: number }[] = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = {
        y: 1,
        logoIndex: Math.floor(Math.random() * compiledPaths.length)
      };
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1.5;
       ctx.shadowBlur = 4;
      ctx.shadowColor = '#00FFFF';


      for (let i = 0; i < rainDrops.length; i++) {
        const path = compiledPaths[rainDrops[i].logoIndex];
        
        ctx.save();
        // Translate to the drop's position
        ctx.translate(i * fontSize, rainDrops[i].y * fontSize);
        // Scale the logo to fit within the font size
        const scale = fontSize / 100; 
        ctx.scale(scale, scale);
        
        ctx.stroke(path);
        
        ctx.restore();

        if (rainDrops[i].y * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i].y = 0;
          rainDrops[i].logoIndex = Math.floor(Math.random() * compiledPaths.length);
        }
        rainDrops[i].y++;
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
