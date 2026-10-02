/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { BusTelemetry, RiskAssessment, OverallRiskLevel } from '../types';
import { Shield, AlertCircle, Compass, Zap, MapPin } from 'lucide-react';

interface RoadwaySimulationCanvasProps {
  telemetry: BusTelemetry;
  riskAssessment: RiskAssessment;
  isScenarioRunning: boolean;
  activeScenarioPhase: string | null;
}

export const RoadwaySimulationCanvas: React.FC<RoadwaySimulationCanvasProps> = ({
  telemetry,
  riskAssessment,
  isScenarioRunning,
  activeScenarioPhase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const roadOffsetRef = useRef<number>(0);
  const blinkStateRef = useRef<boolean>(false);
  const blinkTimerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Hazard light blinking timing (2 Hz)
      blinkTimerRef.current += dt;
      if (blinkTimerRef.current > 0.3) {
        blinkStateRef.current = !blinkStateRef.current;
        blinkTimerRef.current = 0;
      }

      // Scroll road markings based on bus speed
      const speedFactor = telemetry.speedKmH * 5; // px per second
      roadOffsetRef.current = (roadOffsetRef.current + speedFactor * dt) % 80;

      // Handle canvas resolution
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Asphalt Base
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      // Define corridor dimensions
      // Left verge (guardrail): 0 to 40px
      // 3 Main Lanes: x = 50px to 380px (each lane ~110px wide)
      // Solid white line between travel lane and emergency shoulder
      // Right Paved Emergency Shoulder / Bay: x = 380px to 540px
      // Grass / curb embankment: x = 540px to width

      const laneCount = 3;
      const laneWidth = 100;
      const leftGuardrailX = 35;
      const roadStartX = 45;
      const mainRoadWidth = laneCount * laneWidth; // 300px
      const shoulderStartX = roadStartX + mainRoadWidth; // 345px
      const shoulderWidth = 140; // 140px wide shoulder
      const rightBorderX = shoulderStartX + shoulderWidth;

      // Draw Travel Road Surface
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(roadStartX, 0, mainRoadWidth, height);

      // Draw Paved Emergency Shoulder Surface
      // If safer stop active, highlight the shoulder in safe cyan/emerald tone
      const isEmergency = riskAssessment.overallRiskLevel === 'CRITICAL_EMERGENCY' || riskAssessment.overallRiskLevel === 'HIGH';
      ctx.fillStyle = isEmergency ? '#0d2830' : '#172033';
      ctx.fillRect(shoulderStartX, 0, shoulderWidth, height);

      // Shoulder diagonal hatched markings / chevron textures
      ctx.strokeStyle = isEmergency ? 'rgba(6, 182, 212, 0.25)' : 'rgba(100, 116, 139, 0.15)';
      ctx.lineWidth = 3;
      const chevronSpacing = 60;
      const chevronOffset = (roadOffsetRef.current * 0.8) % chevronSpacing;
      for (let y = -chevronSpacing + chevronOffset; y < height + chevronSpacing; y += chevronSpacing) {
        ctx.beginPath();
        ctx.moveTo(shoulderStartX + 10, y);
        ctx.lineTo(rightBorderX - 10, y + 25);
        ctx.stroke();
      }

      // Safe Zone target box designation
      if (isEmergency && riskAssessment.saferStopTarget) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.fillRect(shoulderStartX + 5, 40, shoulderWidth - 10, 180);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(shoulderStartX + 5, 40, shoulderWidth - 10, 180);
        ctx.setLineDash([]);

        // Text label in safe bay
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('DESIGNATED SAFER STOP BAY', shoulderStartX + 12, 70);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText(`Target: ${riskAssessment.saferStopTarget.name.split('-')[0]}`, shoulderStartX + 12, 88);
        ctx.fillText(`Safety Margin: ${riskAssessment.saferStopTarget.safetyMarginScore}%`, shoulderStartX + 12, 104);
        ctx.fillText(`Est. Stop: ${riskAssessment.saferStopTarget.estimatedStoppingSec}s`, shoulderStartX + 12, 120);
      }

      // Left Concrete Parapet / Guardrail
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, leftGuardrailX, height);
      // Guardrail posts
      ctx.fillStyle = '#64748b';
      for (let y = -20 + (roadOffsetRef.current % 40); y < height; y += 40) {
        ctx.fillRect(leftGuardrailX - 12, y, 8, 14);
      }
      // Left Solid Yellow Line
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadStartX, 0);
      ctx.lineTo(roadStartX, height);
      ctx.stroke();

      // Lane dividers (dashed white lines)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -roadOffsetRef.current;

      for (let i = 1; i < laneCount; i++) {
        const lx = roadStartX + i * laneWidth;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        ctx.stroke();
      }
      ctx.setLineDash([]); // reset dash

      // Right Solid White Edge Line (separates travel lanes from shoulder)
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(shoulderStartX, 0);
      ctx.lineTo(shoulderStartX, height);
      ctx.stroke();

      // Right Outer Boundary Curb
      ctx.fillStyle = '#334155';
      ctx.fillRect(rightBorderX, 0, width - rightBorderX, height);

      // -------------------------------------------------------------
      // 2. Bus Dynamics & Position Calculation
      // -------------------------------------------------------------
      // Nominal center is Lane 2 (middle lane): roadStartX + 1.5 * laneWidth = 45 + 150 = 195px
      const nominalBusCenterX = roadStartX + 1.5 * laneWidth;
      // Convert laneDeviationCm (e.g. -120 to +120 cm) to pixel offset
      // Say 1 meter (100cm) = 60 pixels
      let busOffsetX = (telemetry.laneDeviationCm / 100) * 65;

      // If in controlled deceleration or safe stopped, smoothly pull the bus into the shoulder!
      if (telemetry.brakingStatus === 'CONTROLLED_DECELERATION') {
        if (telemetry.speedKmH <= 15) {
          // Bus is pulled into the shoulder bay
          busOffsetX = (shoulderStartX - nominalBusCenterX) + (shoulderWidth / 2);
        } else {
          // Progressively moving toward the shoulder
          const decelRatio = 1 - (telemetry.speedKmH / 50);
          const targetShoulderOffset = (shoulderStartX - nominalBusCenterX) + (shoulderWidth / 2);
          busOffsetX = busOffsetX * (1 - decelRatio) + targetShoulderOffset * decelRatio;
        }
      }

      const busCenterX = Math.max(leftGuardrailX + 30, Math.min(rightBorderX - 25, nominalBusCenterX + busOffsetX));
      const busCenterY = height - 140; // fixed longitudinal perspective

      // Draw Trajectory Prediction Trails
      ctx.lineWidth = 2.5;
      if (isEmergency) {
        // Red erratic drift history trail
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.moveTo(busCenterX, busCenterY);
        ctx.quadraticCurveTo(
          busCenterX + telemetry.steeringAngleDeg * 4,
          busCenterY - 80,
          busCenterX + telemetry.steeringAngleDeg * 9,
          busCenterY - 180
        );
        ctx.stroke();

        // Cyan Guided Safer-Stop Pull-Over Trajectory
        ctx.strokeStyle = '#06b6d4';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(busCenterX, busCenterY);
        const targetPullInX = shoulderStartX + (shoulderWidth / 2);
        ctx.bezierCurveTo(
          busCenterX + 10,
          busCenterY - 60,
          targetPullInX,
          busCenterY - 120,
          targetPullInX,
          80
        );
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Green nominal straight trajectory
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.moveTo(busCenterX, busCenterY);
        ctx.lineTo(busCenterX, 60);
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 3. Draw Public Transit Bus (Top-Down Model)
      // -------------------------------------------------------------
      const busWidth = 52;
      const busLength = 110;
      const busX = busCenterX - busWidth / 2;
      const busY = busCenterY - busLength / 2;

      ctx.save();
      // Apply slight yaw angle from steering
      ctx.translate(busCenterX, busCenterY);
      const yawAngleRad = (telemetry.steeringAngleDeg * Math.PI) / 180 * 0.4;
      ctx.rotate(yawAngleRad);

      // Headlight beams
      const beamGradient = ctx.createLinearGradient(0, -busLength / 2, 0, -busLength / 2 - 120);
      beamGradient.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      beamGradient.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGradient;

      // Left light beam
      ctx.beginPath();
      ctx.moveTo(-busWidth / 2 + 6, -busLength / 2);
      ctx.lineTo(-busWidth / 2 - 25, -busLength / 2 - 120);
      ctx.lineTo(-busWidth / 2 + 15, -busLength / 2 - 120);
      ctx.closePath();
      ctx.fill();

      // Right light beam
      ctx.beginPath();
      ctx.moveTo(busWidth / 2 - 6, -busLength / 2);
      ctx.lineTo(busWidth / 2 - 15, -busLength / 2 - 120);
      ctx.lineTo(busWidth / 2 + 25, -busLength / 2 - 120);
      ctx.closePath();
      ctx.fill();

      // Bus Body Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-busWidth / 2 + 4, -busLength / 2 + 6, busWidth, busLength, 8);
      ctx.fill();

      // Bus Main Chassis (Public Transit Navy / Teal Electric Livery)
      ctx.fillStyle = '#0284c7'; // sky-600
      ctx.beginPath();
      ctx.roundRect(-busWidth / 2, -busLength / 2, busWidth, busLength, 8);
      ctx.fill();

      // Chassis stroke
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Front Windshield
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-busWidth / 2 + 4, -busLength / 2 + 4, busWidth - 8, 20, [4, 4, 1, 1]);
      ctx.fill();

      // Driver Silhouette in Front Cab
      ctx.fillStyle = telemetry.driverStatus === 'POSSIBLE_INCAPACITATION' ? '#ef4444' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(-8, -busLength / 2 + 14, 4, 0, Math.PI * 2);
      ctx.fill();

      // Passenger Cabin Windows
      ctx.fillStyle = '#1e293b';
      // Left row windows
      ctx.fillRect(-busWidth / 2 + 3, -busLength / 2 + 30, 6, 68);
      // Right row windows
      ctx.fillRect(busWidth / 2 - 9, -busLength / 2 + 30, 6, 68);
      // Roof AC / battery unit
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-12, -busLength / 2 + 34, 24, 40);

      // Passenger Load Dots
      const passengerDotsCount = telemetry.passengerLoad === 'CROWDED' ? 16 : 8;
      ctx.fillStyle = telemetry.passengerLoad === 'CROWDED' ? '#fbbf24' : '#94a3b8';
      for (let p = 0; p < passengerDotsCount; p++) {
        const px = -6 + (p % 3) * 6;
        const py = -busLength / 2 + 38 + Math.floor(p / 3) * 7;
        ctx.fillRect(px, py, 2.5, 2.5);
      }

      // Rear Window
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-busWidth / 2 + 4, busLength / 2 - 10, busWidth - 8, 6);

      // Brake Lights
      const isBraking = telemetry.brakingStatus !== 'NONE';
      ctx.fillStyle = isBraking ? '#ef4444' : '#991b1b';
      ctx.fillRect(-busWidth / 2 + 2, busLength / 2 - 3, 10, 4);
      ctx.fillRect(busWidth / 2 - 12, busLength / 2 - 3, 10, 4);

      // Hazard Warning Strobe Lights (Blinking)
      const isHazardActive = telemetry.hazardLightsActive || (isEmergency && blinkStateRef.current);
      if (isHazardActive) {
        ctx.fillStyle = '#f59e0b'; // Amber strobe
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        // Front corners
        ctx.fillRect(-busWidth / 2 - 1, -busLength / 2 - 1, 6, 6);
        ctx.fillRect(busWidth / 2 - 5, -busLength / 2 - 1, 6, 6);
        // Rear corners
        ctx.fillRect(-busWidth / 2 - 1, busLength / 2 - 5, 6, 6);
        ctx.fillRect(busWidth / 2 - 5, busLength / 2 - 5, 6, 6);
        ctx.shadowBlur = 0; // reset
      }

      // Steered Front Wheels
      const wheelAngleRad = (telemetry.steeringAngleDeg * Math.PI) / 180;
      // Left Front Wheel
      ctx.save();
      ctx.translate(-busWidth / 2 - 2, -busLength / 2 + 22);
      ctx.rotate(wheelAngleRad);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-2, -7, 4, 14);
      ctx.restore();

      // Right Front Wheel
      ctx.save();
      ctx.translate(busWidth / 2 + 2, -busLength / 2 + 22);
      ctx.rotate(wheelAngleRad);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-2, -7, 4, 14);
      ctx.restore();

      ctx.restore(); // restore rotation

      // Request next frame
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [telemetry, riskAssessment]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Simulation Header Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Safer-Stop Trajectory Simulation
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            · Simulated GIS Corridor
          </span>
        </div>

        {/* 4-Step Sequence Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className={`px-1.5 py-0.5 rounded ${riskAssessment.overallRiskLevel === 'NORMAL' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-500'}`}>
            1. Current Bus
          </span>
          <span>→</span>
          <span className={`px-1.5 py-0.5 rounded ${riskAssessment.overallRiskLevel === 'ELEVATED' || riskAssessment.overallRiskLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 font-bold' : 'text-slate-500'}`}>
            2. Detected Risk
          </span>
          <span>→</span>
          <span className={`px-1.5 py-0.5 rounded ${riskAssessment.overallRiskLevel === 'CRITICAL_EMERGENCY' && telemetry.speedKmH > 15 ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-500'}`}>
            3. Response Decision
          </span>
          <span>→</span>
          <span className={`px-1.5 py-0.5 rounded ${telemetry.speedKmH <= 5 && riskAssessment.isEmergencyActive ? 'bg-red-950 text-red-300 font-bold' : 'text-slate-500'}`}>
            4. Safer Stop
          </span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full bg-slate-950 flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full max-w-full h-auto rounded border border-slate-800/60 block shadow-inner"
        />

        {/* Floating Real-time HUD badges on the canvas */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-300 shadow">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400">Live Lateral Drift:</span>
            <span className={`font-mono font-bold ${Math.abs(telemetry.laneDeviationCm) > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
              {telemetry.laneDeviationCm > 0 ? `+${telemetry.laneDeviationCm}` : telemetry.laneDeviationCm} cm
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-400">Steering Yaw:</span>
            <span className="font-mono text-slate-300">
              {telemetry.steeringAngleDeg.toFixed(1)}°
            </span>
          </div>
        </div>

        {/* Hazard/Emergency Flasher Overlay on Top-Right */}
        {riskAssessment.isEmergencyActive && (
          <div className="absolute top-4 right-4 bg-red-950/90 border border-red-500/60 text-red-200 rounded px-3 py-2 text-xs shadow-lg max-w-[240px]">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <Zap className="w-3.5 h-3.5 animate-pulse text-red-400" />
              <span>Safer Stop Recommended</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Target: <strong className="text-cyan-300">{riskAssessment.saferStopTarget?.name}</strong>
            </p>
            <div className="mt-1 text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Distance: ~{riskAssessment.saferStopTarget?.distanceMeters}m</span>
              <span>Decel: 3.2 m/s²</span>
            </div>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-700"></span>
              <span>Lanes 1-3 (Travel)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-950 border border-cyan-500"></span>
              <span>Paved Safety Shoulder / Bus Bay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-cyan-400"></span>
              <span>Guided Safer Deceleration Curve</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Speed: <span className="text-white font-bold">{telemetry.speedKmH} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
