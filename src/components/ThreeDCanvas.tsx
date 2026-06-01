/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

export const ThreeDCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Smooth inertia variables for 3D tilt
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = -0.55; // Default elegant angle
    let currentRotY = 0.65;  // Default isometric pan

    // Sizing callback
    const resize = () => {
      if (containerRef.current) {
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Interactive tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      // Map coordinates to small angular offsets (-0.25 to 0.25 radians)
      targetRotX = -0.55 + ((y / height) - 0.5) * 0.45;
      targetRotY = 0.65 + ((x / width) - 0.5) * 0.45;
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      targetRotX = -0.55;
      targetRotY = 0.65;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mouseenter', handleMouseEnter);

    let time = 0;

    // Project 3D coordinate to 2D Screen
    const project = (x: number, y: number, z: number, rx: number, ry: number) => {
      // Rotate around X-axis
      let x1 = x;
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);

      // Rotate around Y-axis
      let x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
      let y2 = y1;
      let z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);

      // Simple perspective projection with central origin
      const cameraDistance = 330;
      const scale = cameraDistance / (cameraDistance + z2);
      const projX = width / 2 + x2 * scale;
      const projY = height / 2.1 + y2 * scale;

      return { x: projX, y: projY, depth: z2 };
    };

    const animate = () => {
      time += 0.012;

      // Elastic interpolation for ultra smooth pan
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Render structural guidelines grid in very soft gold
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 160;
      const gridSteps = 6;
      for (let i = -gridSteps; i <= gridSteps; i++) {
        const pStart1 = project(i * (gridSize / gridSteps), 50, -gridSize, currentRotX, currentRotY);
        const pEnd1 = project(i * (gridSize / gridSteps), 50, gridSize, currentRotX, currentRotY);
        ctx.beginPath();
        ctx.moveTo(pStart1.x, pStart1.y);
        ctx.lineTo(pEnd1.x, pEnd1.y);
        ctx.stroke();

        const pStart2 = project(-gridSize, 50, i * (gridSize / gridSteps), currentRotX, currentRotY);
        const pEnd2 = project(gridSize, 50, i * (gridSize / gridSteps), currentRotX, currentRotY);
        ctx.beginPath();
        ctx.moveTo(pStart2.x, pStart2.y);
        ctx.lineTo(pEnd2.x, pEnd2.y);
        ctx.stroke();
      }

      // Draw Pool Deck Bases (Bottom to Top rendering for depth correctness)
      const basePoints = [
        project(-130, 40, -110, currentRotX, currentRotY), // Front left
        project(130, 40, -110, currentRotX, currentRotY),  // Front right
        project(130, 40, 110, currentRotX, currentRotY),   // Back right
        project(-130, 40, 110, currentRotX, currentRotY)   // Back left
      ];

      // Draw Main Deck slab
      ctx.beginPath();
      ctx.moveTo(basePoints[0].x, basePoints[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(basePoints[i].x, basePoints[i].y);
      }
      ctx.closePath();
      const deckGrad = ctx.createLinearGradient(width / 2, height, width / 2, 0);
      deckGrad.addColorStop(0, '#10152a'); // Rich royal deck slate
      deckGrad.addColorStop(1, '#0e1224');
      ctx.fillStyle = deckGrad;
      ctx.fill();
      ctx.strokeStyle = '#d4af37'; // Royal Gold border trim
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Double-sided Infinity Pool Glowing Layer
      const poolPoints = [
        project(-110, 42, -90, currentRotX, currentRotY),
        project(30, 42, -90, currentRotX, currentRotY),
        project(30, 42, 60, currentRotX, currentRotY),
        project(-110, 42, 60, currentRotX, currentRotY)
      ];

      ctx.beginPath();
      ctx.moveTo(poolPoints[0].x, poolPoints[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(poolPoints[i].x, poolPoints[i].y);
      }
      ctx.closePath();
      const waterGrad = ctx.createRadialGradient(
        width / 2, height / 2, 10,
        width / 2, height / 2, 250
      );
      waterGrad.addColorStop(0, '#10b981'); // Emerald gardens core glow
      waterGrad.addColorStop(0.7, '#0284c7'); // Sapphire water
      waterGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = waterGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; // Shimmer limit
      ctx.stroke();

      // Pool Water Animated Ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1;
      const rippleRadius = (time * 18) % 45 + 5;
      const poolCenter = project(-40, 42, -15, currentRotX, currentRotY);
      
      ctx.beginPath();
      ctx.ellipse(poolCenter.x, poolCenter.y, rippleRadius, rippleRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Second ripple offset
      const rippleRadius2 = ((time + 0.5) * 18) % 45 + 5;
      ctx.beginPath();
      ctx.ellipse(poolCenter.x, poolCenter.y, rippleRadius2, rippleRadius2 * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();

      // draw luxurious resort pavilion building wireframe
      // Front Luxury Suite Cabin (positioned at X: 45 to 110, Y: -60 to 40, Z: -80 to 80)
      const frontSuiteLeft = 45;
      const frontSuiteRight = 115;
      const frontSuiteBottom = 40;
      const frontSuiteTop = -45;
      const frontSuiteFront = -80;
      const frontSuiteBack = 70;

      const cabinCoords = [
        project(frontSuiteLeft, frontSuiteBottom, frontSuiteFront, currentRotX, currentRotY),  // 0: B-FL
        project(frontSuiteRight, frontSuiteBottom, frontSuiteFront, currentRotX, currentRotY), // 1: B-FR
        project(frontSuiteRight, frontSuiteBottom, frontSuiteBack, currentRotX, currentRotY),  // 2: B-BR
        project(frontSuiteLeft, frontSuiteBottom, frontSuiteBack, currentRotX, currentRotY),   // 3: B-BL
        project(frontSuiteLeft, frontSuiteTop, frontSuiteFront, currentRotX, currentRotY),     // 4: T-FL
        project(frontSuiteRight, frontSuiteTop, frontSuiteFront, currentRotX, currentRotY),    // 5: T-FR
        project(frontSuiteRight, frontSuiteTop, frontSuiteBack, currentRotX, currentRotY),     // 6: T-BR
        project(frontSuiteLeft, frontSuiteTop, frontSuiteBack, currentRotX, currentRotY)      // 7: T-BL
      ];

      // Draw Glass Walls (Semireflective)
      ctx.beginPath();
      ctx.moveTo(cabinCoords[0].x, cabinCoords[0].y);
      ctx.lineTo(cabinCoords[4].x, cabinCoords[4].y);
      ctx.lineTo(cabinCoords[5].x, cabinCoords[5].y);
      ctx.lineTo(cabinCoords[1].x, cabinCoords[1].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)'; // Golden warm lit room
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)'; // Structural pillars gold
      ctx.stroke();

      // Window Glowing Interior Nodes
      const glowCenter = project((frontSuiteLeft + frontSuiteRight) / 2, (frontSuiteBottom + frontSuiteTop) / 2, (frontSuiteFront + frontSuiteBack) / 2, currentRotX, currentRotY);
      const glowGrad = ctx.createRadialGradient(glowCenter.x, glowCenter.y, 2, glowCenter.x, glowCenter.y, 25);
      glowGrad.addColorStop(0, '#f59e0b'); // Golden sun glow
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(glowCenter.x, glowCenter.y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Right Side glass wall
      ctx.beginPath();
      ctx.moveTo(cabinCoords[1].x, cabinCoords[1].y);
      ctx.lineTo(cabinCoords[5].x, cabinCoords[5].y);
      ctx.lineTo(cabinCoords[6].x, cabinCoords[6].y);
      ctx.lineTo(cabinCoords[2].x, cabinCoords[2].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'; // Tiny emerald garden tint
      ctx.fill();
      ctx.stroke();

      // Draw Flat Overhanging Floating Roof Canopy (Extremely high-end, futuristic)
      ctx.beginPath();
      ctx.moveTo(cabinCoords[4].x, cabinCoords[4].y);
      ctx.lineTo(cabinCoords[5].x, cabinCoords[5].y);
      ctx.lineTo(cabinCoords[6].x, cabinCoords[6].y);
      ctx.lineTo(cabinCoords[7].x, cabinCoords[7].y);
      ctx.closePath();
      ctx.fillStyle = '#1e293b'; // Charcoal slate canopy
      ctx.fill();
      ctx.strokeStyle = '#d4af37'; // Golden gold trim
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add elegant gold lines to indicate glass panes partitions
      const middleX = (frontSuiteLeft + frontSuiteRight) / 2;
      const bottomMid = project(middleX, frontSuiteBottom, frontSuiteFront, currentRotX, currentRotY);
      const topMid = project(middleX, frontSuiteTop, frontSuiteFront, currentRotX, currentRotY);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bottomMid.x, bottomMid.y);
      ctx.lineTo(topMid.x, topMid.y);
      ctx.stroke();

      // Elegant Animated Coorg Palm Tree (Front left landscape, coordinates: X -115, Y: 40, Z: -150)
      const windOffset = Math.sin(time) * 3;
      const trunkPoints = [
        project(-115, 40, -50, currentRotX, currentRotY),
        project(-118, 10, -50, currentRotX, currentRotY),
        project(-120 + windOffset, -18, -50, currentRotX, currentRotY)
      ];

      // Draw Tree Trunk
      ctx.strokeStyle = '#38220f'; // Dark wood
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(trunkPoints[0].x, trunkPoints[0].y);
      ctx.quadraticCurveTo(trunkPoints[1].x, trunkPoints[1].y, trunkPoints[2].x, trunkPoints[2].y);
      ctx.stroke();

      // Palm fronds (swaying)
      ctx.fillStyle = '#0f766e'; // Deep emerald leaves
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const leafEndX = trunkPoints[2].x + Math.cos(angle + windOffset * 0.05) * (18 + Math.sin(time * 2) * 1.5);
        const leafEndY = trunkPoints[2].y + Math.sin(angle) * 7 - 5;
        
        ctx.beginPath();
        ctx.ellipse(
          (trunkPoints[2].x + leafEndX) / 2, 
          (trunkPoints[2].y + leafEndY) / 2, 
          9, 3, 
          angle + windOffset * 0.05, 
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Elegant text marker coordinates floating (X: 100, Y: -75, Z: -100)
      const beaconCenter = project(80, -90, -30, currentRotX, currentRotY);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
      ctx.beginPath();
      ctx.arc(beaconCenter.x, beaconCenter.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Glowing radar pulse
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1;
      const radarRadius = (time * 12) % 18 + 4;
      ctx.beginPath();
      ctx.arc(beaconCenter.x, beaconCenter.y, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Float Label Box
      ctx.fillStyle = 'rgba(13, 19, 38, 0.85)';
      ctx.strokeStyle = 'rgba(212,175,55,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(beaconCenter.x - 65, beaconCenter.y - 34, 130, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 9px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROMIDE RESIDENCY', beaconCenter.x, beaconCenter.y - 19);

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (containerRef.current) {
        ro.unobserve(containerRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      id="three-d-panel"
      ref={containerRef}
      className="relative w-full h-[320px] md:h-[450px] bg-slate-950/40 rounded-2xl overflow-hidden glass-panel border border-white/5 shadow-2xl flex items-center justify-center group cursor-crosshair transition-all duration-500 hover:border-gold/30 hover:shadow-gold/5"
    >
      <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-white/30 pointer-events-none uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/5">
        Residency Engine: {isHovered ? 'Active Tracking' : 'Standby Pan'}
      </div>
      <div className="absolute bottom-4 right-4 z-10 text-right pointer-events-none">
        <p className="text-[10px] font-sans text-gold tracking-widest uppercase font-semibold">COORG VILLA MODEL</p>
        <p className="text-[8px] font-mono text-white/40">Tilt standard mouse to explore panorama</p>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
