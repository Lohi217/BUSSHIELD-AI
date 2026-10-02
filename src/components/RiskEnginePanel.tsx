/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskAssessment, BusTelemetry } from '../types';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, Layers, HelpCircle, ArrowRight, CornerDownRight } from 'lucide-react';

interface RiskEnginePanelProps {
  riskAssessment: RiskAssessment;
  telemetry: BusTelemetry;
}

export const RiskEnginePanel: React.FC<RiskEnginePanelProps> = ({
  riskAssessment,
  telemetry,
}) => {
  const isEmergency = riskAssessment.overallRiskLevel === 'CRITICAL_EMERGENCY';
  const isHigh = riskAssessment.overallRiskLevel === 'HIGH';
  const isElevated = riskAssessment.overallRiskLevel === 'ELEVATED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              BUSSHIELD Risk Engine
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50">
                Rule-Based Core (MVP)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Multi-factor context-aware inference & anti-false-alarm correlation
            </p>
          </div>
        </div>

        {/* Modular ML-ready indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Engine Interface: Modular ML-Ready</span>
        </div>
      </div>

      {/* WHY The Risk Was Triggered (Explainability Box) */}
      <div className={`p-3.5 rounded-lg border transition-all ${
        isEmergency
          ? 'bg-red-950/40 border-red-500/50 text-red-200'
          : isHigh
          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          : isElevated
          ? 'bg-yellow-950/30 border-yellow-600/40 text-yellow-200'
          : 'bg-slate-950 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Inference Summary:
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              "{riskAssessment.summaryReason}"
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[10px] uppercase font-mono block text-slate-400">
              Evaluated Score
            </span>
            <span className={`text-xl font-bold font-mono ${
              isEmergency ? 'text-red-400' : isHigh ? 'text-amber-400' : isElevated ? 'text-yellow-400' : 'text-emerald-400'
            }`}>
              {riskAssessment.riskScore}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">/ 100</span>
          </div>
        </div>

        {/* Explainability Breakdown Badges */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
          {telemetry.driverStatus !== 'NORMAL' && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Possible loss of driver control detected
            </span>
          )}
          {Math.abs(telemetry.laneDeviationCm) >= 45 && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-amber-400" />
              Lane deviation increasing ({Math.abs(telemetry.laneDeviationCm)}cm)
            </span>
          )}
          {telemetry.passengerLoad === 'CROWDED' && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              Passenger load is high (Crowded bus)
            </span>
          )}
          {telemetry.roadRisk === 'HIGH' && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-red-400" />
              Road risk is high ({telemetry.roadContext.name})
            </span>
          )}
          {riskAssessment.overallRiskLevel === 'NORMAL' && (
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All sensors operating within normal safety variance.
            </span>
          )}
        </div>
      </div>

      {/* Multi-Factor Mathematical Breakdown Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">1. Driver Abnormality</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">
            {riskAssessment.driverRiskScore} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Eye, head & grip telemetry</div>
        </div>

        <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">2. Vehicle Instability</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">
            {riskAssessment.vehicleRiskScore} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Lane departure & steering jitter</div>
        </div>

        <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">3. Context Multiplier</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
            x{riskAssessment.contextMultiplier.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Crowd density & road hazard tier</div>
        </div>

        <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">4. Anti-False-Alarm Gating</div>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dual Correlation
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Suppresses single weak glitch</div>
        </div>
      </div>

      {/* Triggered Rule Audit Trail */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Active Rule Evaluation Trail ({riskAssessment.explanations.length} triggered)</span>
          <span className="text-[10px] text-slate-500">Live CAN/Vision Arbitration</span>
        </h3>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {riskAssessment.explanations.length === 0 ? (
            <div className="text-xs text-slate-400 italic p-3 bg-slate-950 rounded border border-slate-800/60 text-center">
              No anomaly rules triggered. Operational telemetry is within safe nominal limits.
            </div>
          ) : (
            riskAssessment.explanations.map((exp, idx) => (
              <div
                key={`${exp.ruleId}-${idx}`}
                className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-xs flex items-start gap-2.5"
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  exp.severity === 'critical' ? 'bg-red-400 animate-ping' : exp.severity === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200">
                      {exp.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {exp.ruleId} · {exp.factor}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exp.detail}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
