/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BusTelemetry,
  RiskAssessment,
  OverallRiskLevel,
  DriverStatus,
  PassengerLoad,
  RoadRiskLevel,
} from '../types';
import {
  Gauge,
  Compass,
  Users,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Eye,
  HandMetal,
  Activity,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ControlRoomDashboardProps {
  telemetry: BusTelemetry;
  riskAssessment: RiskAssessment;
  speedHistory: number[];
  laneHistory: number[];
}

export const ControlRoomDashboard: React.FC<ControlRoomDashboardProps> = ({
  telemetry,
  riskAssessment,
  speedHistory,
  laneHistory,
}) => {
  // Format driver status badge
  const renderDriverStatus = (status: DriverStatus) => {
    switch (status) {
      case 'POSSIBLE_INCAPACITATION':
        return (
          <span className="text-red-400 font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            POSSIBLE INCAPACITATION
          </span>
        );
      case 'DROWSY':
        return (
          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            DROWSY / REDUCED ATTENTION
          </span>
        );
      default:
        return (
          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            NORMAL (VIGILANT)
          </span>
        );
    }
  };

  // Passenger load badge
  const renderPassengerLoad = (load: PassengerLoad, count: number, cap: number) => {
    const isCrowded = load === 'CROWDED' || count > 45;
    return (
      <div className="flex items-baseline gap-2">
        <span className={`text-base font-bold ${isCrowded ? 'text-amber-400' : 'text-slate-200'}`}>
          {isCrowded ? 'CROWDED' : 'NORMAL'}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          ({count}/{cap} passengers)
        </span>
      </div>
    );
  };

  // Road risk badge
  const renderRoadRisk = (risk: RoadRiskLevel) => {
    switch (risk) {
      case 'HIGH':
        return <span className="text-red-400 font-bold">HIGH RISK</span>;
      case 'MEDIUM':
        return <span className="text-yellow-400 font-semibold">MEDIUM RISK</span>;
      default:
        return <span className="text-emerald-400 font-medium">LOW RISK</span>;
    }
  };

  // Lane deviation bar visualization
  const maxDeviation = 120; // cm max range for indicator
  const deviationPercent = Math.max(-100, Math.min(100, (telemetry.laneDeviationCm / maxDeviation) * 100));

  return (
    <div className="space-y-4">
      {/* Top Banner: Bus Identification & Route Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-white font-mono font-bold text-base tracking-wide">
                {telemetry.busId}
              </span>
              <span className="text-slate-500 font-mono text-xs">·</span>
              <span className="text-cyan-300 text-xs font-medium">
                {telemetry.route}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Operator: {telemetry.driverName}</span>
              <span className="text-slate-600">·</span>
              <span>Corridor: {telemetry.roadContext.name}</span>
            </div>
          </div>
        </div>

        {/* Live Risk Meter summary pill */}
        <div className="flex items-center gap-4 bg-slate-950 px-3.5 py-2 rounded-md border border-slate-800/80 w-full md:w-auto justify-between md:justify-start">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Overall Risk Level
            </div>
            <div className="text-sm font-bold tracking-tight">
              {riskAssessment.overallRiskLevel === 'CRITICAL_EMERGENCY' ? (
                <span className="text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                  CRITICAL EMERGENCY
                </span>
              ) : riskAssessment.overallRiskLevel === 'HIGH' ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  HIGH RISK
                </span>
              ) : riskAssessment.overallRiskLevel === 'ELEVATED' ? (
                <span className="text-yellow-400">ELEVATED</span>
              ) : (
                <span className="text-emerald-400">NORMAL</span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Risk Score
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {riskAssessment.riskScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Telemetry & Decision Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Driver State */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Driver Status
            </span>
            <span className="text-[11px] font-mono text-slate-500">Cab Sensor #D1</span>
          </div>

          <div className="my-3">
            {renderDriverStatus(telemetry.driverStatus)}
            <p className="text-xs text-slate-400 mt-1">
              Gaze closure: <strong className="text-slate-200">{Math.round(telemetry.eyeClosurePercent)}%</strong> · Head pose offset: <strong className="text-slate-200">{Math.round(telemetry.headPoseDeviation)}%</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <HandMetal className="w-3.5 h-3.5" /> Hands On Wheel:
            </span>
            <span className={`font-mono font-semibold ${telemetry.handsOnWheel ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>
              {telemetry.handsOnWheel ? 'CONFIRMED' : 'NOT DETECTED'}
            </span>
          </div>
        </div>

        {/* Card 2: Vehicle Speed & Braking */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Speed & Braking
            </span>
            <span className="text-[11px] font-mono text-slate-500">CAN-Bus #V8</span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {telemetry.speedKmH}
              </span>
              <span className="text-xs text-slate-400 ml-1">km/h</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span>Limit: </span>
              <span className="font-mono text-slate-200">{telemetry.roadContext.speedLimitKmH} km/h</span>
            </div>
          </div>

          {/* Simple speed sparkline trend */}
          <div className="h-4 flex items-end gap-1 mb-2">
            {speedHistory.slice(-14).map((val, idx) => {
              const heightPct = Math.min(100, Math.max(10, (val / 80) * 100));
              return (
                <div
                  key={idx}
                  className="flex-1 bg-cyan-700/60 rounded-xs"
                  style={{ height: `${heightPct}%` }}
                  title={`${val} km/h`}
                />
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Braking Status:</span>
            <span className={`font-mono font-semibold ${
              telemetry.brakingStatus === 'PANIC' || telemetry.brakingStatus === 'IRREGULAR'
                ? 'text-red-400'
                : telemetry.brakingStatus === 'CONTROLLED_DECELERATION'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-300'
            }`}>
              {telemetry.brakingStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Card 3: Steering Stability & Lane Deviation */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Steering & Lane
            </span>
            <span className="text-[11px] font-mono text-slate-500">IMU / Vision</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Steering Stability:</span>
              <span className={`text-sm font-mono font-bold ${
                telemetry.steeringStabilityScore < 35
                  ? 'text-red-400'
                  : telemetry.steeringStabilityScore < 65
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
              }`}>
                {Math.round(telemetry.steeringStabilityScore)}%
              </span>
            </div>

            {/* Visual Lane Offset Gauge */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span>Left Verge</span>
                <span className={Math.abs(telemetry.laneDeviationCm) > 60 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {telemetry.laneDeviationCm > 0 ? `+${telemetry.laneDeviationCm}` : telemetry.laneDeviationCm} cm
                </span>
                <span>Right Verge</span>
              </div>
              <div className="h-2.5 bg-slate-950 rounded-full border border-slate-800 relative overflow-hidden">
                {/* Center marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 -translate-x-1/2"></div>
                {/* Active drift marker */}
                <div
                  className={`absolute top-0 bottom-0 w-2.5 rounded-full -translate-x-1/2 transition-all duration-200 ${
                    Math.abs(telemetry.laneDeviationCm) > 75
                      ? 'bg-red-500 shadow-sm shadow-red-500'
                      : Math.abs(telemetry.laneDeviationCm) > 40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{
                    left: `${50 + (deviationPercent / 2)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Steering Angle:</span>
            <span className="font-mono text-slate-300">
              {telemetry.steeringAngleDeg > 0 ? `+${telemetry.steeringAngleDeg.toFixed(1)}°` : `${telemetry.steeringAngleDeg.toFixed(1)}°`}
            </span>
          </div>
        </div>

        {/* Card 4: Passenger Crowd & Road Risk Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Crowd & Road Context
            </span>
            <span className="text-[11px] font-mono text-slate-500">Context Engine</span>
          </div>

          <div className="my-2 space-y-1.5">
            <div>
              <span className="text-[11px] text-slate-400 block">Passenger Load:</span>
              {renderPassengerLoad(telemetry.passengerLoad, telemetry.passengerCount, telemetry.passengerCapacity)}
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Road Hazard Tier:</span>
              <div className="flex items-baseline gap-2">
                {renderRoadRisk(telemetry.roadRisk)}
                <span className="text-xs text-slate-400 truncate">
                  ({telemetry.roadContext.type.replace('_', ' ')})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Context Multiplier:</span>
            <span className="font-mono font-semibold text-cyan-300">
              x{riskAssessment.contextMultiplier.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
