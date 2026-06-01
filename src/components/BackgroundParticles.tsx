/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial particle seeding
    const maxParticles = 55;
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -Math.random() * 0.25 - 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        fadeSpeed: (Math.random() - 0.5) * 0.002
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a premium subtle background gradient wash
      ctx.fillStyle = '#050508'; // Pure immersive deep cosmic black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create ambient warm radial lighting masks to match the design's overlay exactly
      const radialGrad1 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.3, Math.max(canvas.width, canvas.height) * 0.6
      );
      radialGrad1.addColorStop(0, 'rgba(6, 78, 59, 0.15)'); // Emerald garden aura
      radialGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGrad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const radialGrad2 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.8, 0,
        canvas.width * 0.2, canvas.height * 0.8, Math.max(canvas.width, canvas.height) * 0.5
      );
      radialGrad2.addColorStop(0, 'rgba(212, 175, 55, 0.08)'); // Gold light aura (very soft)
      radialGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGrad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Floating Luxury Gold Dust
      ctx.fillStyle = 'rgba(212, 175, 55, 0.6)'; // Gold dust glow
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();

        // Update positions smoothly
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeSpeed;

        // Boundaries reset
        if (p.opacity < 0.05 || p.opacity > 0.7) {
          p.fadeSpeed = -p.fadeSpeed;
        }
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="bg-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
};
