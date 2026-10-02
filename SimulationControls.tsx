/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BusTelemetry, PassengerLoad, RoadRiskLevel, BrakingStatus, DriverStatus } from '../types';
import { ROAD_CONTEXTS, TELEMETRY_PRESETS } from '../engine/simulationData';
import { Sliders, RefreshCw, Eye, Gauge, Compass, Users, MapPin, HandMetal, AlertTriangle } from 'lucide-react';

interface SimulationControlsProps {
  telemetry: BusTelemetry;
  onUpdateTelemetry: (patch: Partial<BusTelemetry>) => void;
  onApplyPreset: (presetKey: keyof typeof TELEMETRY_PRESETS) => void;
  isScenarioRunning: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  telemetry,
  onUpdateTelemetry,
  onApplyPreset,
  isScenarioRunning,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Live Telemetry Simulation Controls
            </h2>
            <p className="text-xs text-slate-400">
              Inject simulated driver, vehicle, and roadway variables
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Simulation Presets */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
          Quick Simulation Scenarios:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onApplyPreset('NORMAL')}
            disabled={isScenarioRunning}
            className={`p-2.5 rounded border text-left transition-all ${
              telemetry.driverStatus === 'NORMAL' && Math.abs(telemetry.laneDeviationCm) < 20
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold">Normal Driving</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Alert driver, steady lane</div>
          </button>

          <button
            onClick={() => onApplyPreset('DROWSY_BEHAVIOUR')}
            disabled={isScenarioRunning}
            className={`p-2.5 rounded border text-left transition-all ${
              telemetry.driverStatus === 'DROWSY'
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold">Drowsy / Abnormal</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Fatigue blinks, micro-drift</div>
          </button>

          <button
            onClick={() => onApplyPreset('POSSIBLE_INCAPACITATION')}
            disabled={isScenarioRunning}
            className={`p-2.5 rounded border text-left transition-all ${
              telemetry.driverStatus === 'POSSIBLE_INCAPACITATION' && !telemetry.handsOnWheel
                ? 'bg-red-950/80 border-red-500/70 text-red-200 ring-1 ring-red-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-red-300">Driver Incapacitation</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Eyes closed, hands off wheel</div>
          </button>

          <button
            onClick={() => onApplyPreset('SUDDEN_CONTROL_LOSS')}
            disabled={isScenarioRunning}
            className={`p-2.5 rounded border text-left transition-all ${
              telemetry.steeringStabilityScore <= 20
                ? 'bg-red-950/80 border-red-500/70 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-red-300">Loss of Vehicle Control</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Severe swerve & drift</div>
          </button>
        </div>
      </div>

      {/* Context Controls: Crowd & Road Hazard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        {/* Passenger Crowd Toggle */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Passenger Load Context:
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {telemetry.passengerCount} / {telemetry.passengerCapacity} commuters
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                onUpdateTelemetry({
                  passengerLoad: 'NORMAL',
                  passengerCount: 26,
                })
              }
              className={`py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                telemetry.passengerLoad === 'NORMAL'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Normal Load (26)
            </button>
            <button
              onClick={() =>
                onUpdateTelemetry({
                  passengerLoad: 'CROWDED',
                  passengerCount: 56,
                })
              }
              className={`py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                telemetry.passengerLoad === 'CROWDED'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Crowded Bus (56)
            </button>
          </div>
        </div>

        {/* Road Risk Environment */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Road Segment Risk:
            </span>
            <span className={`text-xs font-bold ${
              telemetry.roadRisk === 'HIGH' ? 'text-red-400' : telemetry.roadRisk === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
            }`}>
              {telemetry.roadRisk}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() =>
                onUpdateTelemetry({
                  roadRisk: 'LOW',
                  roadContext: ROAD_CONTEXTS.NORMAL_ARTERIAL,
                })
              }
              className={`py-1.5 px-1 text-[11px] font-medium rounded transition-colors ${
                telemetry.roadRisk === 'LOW'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Normal Road
            </button>
            <button
              onClick={() =>
                onUpdateTelemetry({
                  roadRisk: 'MEDIUM',
                  roadContext: ROAD_CONTEXTS.GHAT_SECTION,
                })
              }
              className={`py-1.5 px-1 text-[11px] font-medium rounded transition-colors ${
                telemetry.roadRisk === 'MEDIUM'
                  ? 'bg-yellow-700 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Ghat Curves
            </button>
            <button
              onClick={() =>
                onUpdateTelemetry({
                  roadRisk: 'HIGH',
                  roadContext: ROAD_CONTEXTS.ELEVATED_FLYOVER,
                })
              }
              className={`py-1.5 px-1 text-[11px] font-medium rounded transition-colors ${
                telemetry.roadRisk === 'HIGH'
                  ? 'bg-red-700 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              High-Risk Flyover
            </button>
          </div>
        </div>
      </div>

      {/* Manual Fine-Tuning Sliders */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-3">
          Fine-Grained Telemetry Parameter Adjusters:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Driver Eye Closure */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" /> Eye Closure:
              </span>
              <span className="font-mono text-slate-200 font-bold">
                {Math.round(telemetry.eyeClosurePercent)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={telemetry.eyeClosurePercent}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateTelemetry({
                  eyeClosurePercent: val,
                  driverStatus: val > 75 ? 'POSSIBLE_INCAPACITATION' : val > 40 ? 'DROWSY' : 'NORMAL',
                });
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Hands on Steering Wheel */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block flex items-center gap-1">
                <HandMetal className="w-3 h-3 text-cyan-400" /> Hands on Wheel:
              </span>
              <span className={`text-xs font-mono font-bold ${telemetry.handsOnWheel ? 'text-emerald-400' : 'text-red-400'}`}>
                {telemetry.handsOnWheel ? 'Detected on Rim' : 'Hands Slipping Off'}
              </span>
            </div>
            <button
              onClick={() => onUpdateTelemetry({ handsOnWheel: !telemetry.handsOnWheel })}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                telemetry.handsOnWheel
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  : 'bg-red-950 text-red-300 border border-red-700/60'
              }`}
            >
              Toggle
            </button>
          </div>

          {/* Lane Deviation Slider */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" /> Lane Drift:
              </span>
              <span className={`font-mono font-bold ${Math.abs(telemetry.laneDeviationCm) > 60 ? 'text-red-400' : 'text-slate-200'}`}>
                {telemetry.laneDeviationCm} cm
              </span>
            </div>
            <input
              type="range"
              min={-120}
              max={120}
              value={telemetry.laneDeviationCm}
              onChange={(e) => onUpdateTelemetry({ laneDeviationCm: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Vehicle Speed Slider */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" /> Speed:
              </span>
              <span className="font-mono text-slate-200 font-bold">
                {telemetry.speedKmH} km/h
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={85}
              value={telemetry.speedKmH}
              onChange={(e) => onUpdateTelemetry({ speedKmH: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Steering Stability Slider */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Steering Stability:</span>
              <span className={`font-mono font-bold ${telemetry.steeringStabilityScore < 35 ? 'text-red-400' : 'text-slate-200'}`}>
                {Math.round(telemetry.steeringStabilityScore)}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={telemetry.steeringStabilityScore}
              onChange={(e) => onUpdateTelemetry({ steeringStabilityScore: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Braking Mode Selector */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Braking Action:</span>
              <span className="font-mono text-cyan-300 font-bold text-[11px]">
                {telemetry.brakingStatus}
              </span>
            </div>
            <select
              value={telemetry.brakingStatus}
              onChange={(e) => onUpdateTelemetry({ brakingStatus: e.target.value as BrakingStatus })}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none focus:border-cyan-500"
            >
              <option value="NONE">NONE (Coast / Cruise)</option>
              <option value="NORMAL">NORMAL (Pedal Actuated)</option>
              <option value="IRREGULAR">IRREGULAR (Erratic Pulsing)</option>
              <option value="PANIC">PANIC (Full Lockup)</option>
              <option value="CONTROLLED_DECELERATION">CONTROLLED DECELERATION (Safer Stop)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
