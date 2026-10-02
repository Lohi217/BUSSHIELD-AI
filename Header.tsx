/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Info, Play, RotateCcw, Activity, Radio, AlertTriangle } from 'lucide-react';
import { OverallRiskLevel } from '../types';

interface HeaderProps {
  overallRisk: OverallRiskLevel;
  riskScore: number;
  isScenarioRunning: boolean;
  activeScenarioPhase: string | null;
  onRunDemoScenario: () => void;
  onResetSimulation: () => void;
  autoTickRealism: boolean;
  onToggleAutoTick: () => void;
  onOpenBenchmark: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  overallRisk,
  riskScore,
  isScenarioRunning,
  activeScenarioPhase,
  onRunDemoScenario,
  onResetSimulation,
  autoTickRealism,
  onToggleAutoTick,
  onOpenBenchmark,
}) => {
  const getRiskStatusBadge = () => {
    switch (overallRisk) {
      case 'CRITICAL_EMERGENCY':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-semibold rounded animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            CRITICAL EMERGENCY · PROTOCOL ACTIVE
          </div>
        );
      case 'HIGH':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-semibold rounded">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            HIGH RISK · INTERVENTION READY
          </div>
        );
      case 'ELEVATED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-950/60 border border-yellow-600/40 text-yellow-300 text-xs font-medium rounded">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            ELEVATED · MONITORING DRIFT
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-medium rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            NOMINAL · CABIN VIGILANT
          </div>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-30 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Hackathon Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BUSSHIELD<span className="text-cyan-400 font-black">AI</span>
              </h1>
              <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                TRANSIT SAFETY MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Context-Aware Emergency Decision System for Public Transit
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3">
          {getRiskStatusBadge()}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-mono px-2.5 py-1 bg-slate-950/80 rounded border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Score:</span>
            <span className={`font-bold ${riskScore > 65 ? 'text-red-400' : riskScore > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {riskScore}/100
            </span>
          </div>
        </div>

        {/* Quick Demo Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRunDemoScenario}
            disabled={isScenarioRunning}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-all ${
              isScenarioRunning
                ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50 cursor-wait'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40 shadow-cyan-950/50 active:scale-95'
            }`}
            title="Demonstrates: Normal → Driver Abnormality → Vehicle Drift → Escalation → Safer-Stop Recommendation"
          >
            {isScenarioRunning ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>Simulating: {activeScenarioPhase || 'Running...'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN EMERGENCY SCENARIO</span>
              </>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
            title="Reset telemetry to baseline normal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-100 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-md transition-colors"
            title="View Before vs After comparative metrics"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Before vs After</span>
          </button>

          <button
            onClick={onToggleAutoTick}
            className={`px-2 py-1 text-[11px] rounded font-mono border transition-colors ${
              autoTickRealism
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle realistic micro-jitter on telemetry stream"
          >
            {autoTickRealism ? 'LIVE STREAM' : 'PAUSED'}
          </button>
        </div>
      </div>
    </header>
  );
};
