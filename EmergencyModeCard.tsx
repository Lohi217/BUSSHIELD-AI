/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskAssessment, BusTelemetry } from '../types';
import {
  AlertOctagon,
  Radio,
  Volume2,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface EmergencyModeCardProps {
  riskAssessment: RiskAssessment;
  telemetry: BusTelemetry;
  onAcknowledgeAlert?: () => void;
}

export const EmergencyModeCard: React.FC<EmergencyModeCardProps> = ({
  riskAssessment,
  telemetry,
  onAcknowledgeAlert,
}) => {
  if (!riskAssessment.isEmergencyActive) {
    return null;
  }

  const isCritical = riskAssessment.overallRiskLevel === 'CRITICAL_EMERGENCY';
  const targetZone = riskAssessment.saferStopTarget;

  return (
    <div className="bg-red-950/70 border-2 border-red-500 rounded-lg p-4 text-white shadow-2xl relative overflow-hidden transition-all animate-in fade-in duration-300">
      {/* Top alert flashing strobe strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-red-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-red-800 text-red-100 border border-red-400">
                CRITICAL EMERGENCY RESPONSE PROTOCOL
              </span>
              <span className="text-xs text-red-300 font-mono">
                {telemetry.busId}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white mt-1">
              Possible Driver Incapacitation Detected
            </h2>
            <p className="text-xs text-red-200">
              Emergency Response Activated · Safer Stop Recommended
            </p>
          </div>
        </div>

        {/* Timestamp & Dispatch Packet status */}
        <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-red-300 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" /> Incident Timestamp
            </div>
            <div className="text-xs font-mono font-bold text-white">
              {riskAssessment.timestampIso.replace('T', ' ').slice(0, 19)} UTC
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 3 Emergency Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {/* Col 1: Safer Stop Recommendation & Target Zone */}
        <div className="bg-slate-950/80 border border-red-800/70 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              1. Safer Stop Recommendation
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Recommended Safe Zone (Simulated GIS):</span>
                <span className="font-bold text-slate-100 text-sm">
                  {targetZone?.name || 'Designated Highway Safety Pocket'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-300">
                <span>Distance to Safe Zone:</span>
                <span className="font-mono font-bold text-cyan-300">{targetZone?.distanceMeters || 280} meters</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Zone Safety Rating:</span>
                <span className="font-mono font-bold text-emerald-400">{targetZone?.safetyMarginScore || 92}/100</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">Stopping Status:</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, 100 - (telemetry.speedKmH / 55) * 100)}%` }}
                ></div>
              </div>
              <span className="font-mono text-xs text-cyan-300 font-bold">
                {telemetry.speedKmH === 0 ? 'SAFELY STOPPED' : `~${targetZone?.estimatedStoppingSec || 8.5}s to stop`}
              </span>
            </div>
          </div>
        </div>

        {/* Col 2: Transport Control Room Dispatch Packet */}
        <div className="bg-slate-950/80 border border-red-800/70 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-400" />
                2. Transport Control Room Alert
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Transmitted
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Packet ID:</span>
                <span className="text-white font-bold">{riskAssessment.alertDispatch.dispatchPacketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Corridor GPS:</span>
                <span className="text-cyan-300">12.9279° N, 77.6271° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alert Code:</span>
                <span className="text-red-400 font-bold">SIG-401 (TRANSIT_EMERGENCY)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Support Units:</span>
                <span className="text-emerald-400">Patrol 14 & EMS Standby</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-slate-400 italic">
            Automated packet relayed to Central Transit Operations & nearest emergency dispatch depot.
          </div>
        </div>

        {/* Col 3: Passenger Safety Alert (In-Cabin PA & Display) */}
        <div className="bg-slate-950/80 border border-red-800/70 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-300 uppercase tracking-wider mb-2">
              <Volume2 className="w-4 h-4 text-red-400" />
              3. In-Cabin Passenger Safety Alert
            </div>

            <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-xs text-red-100 space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-300 uppercase">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                In-Cabin Audio/Visual Broadcast Active:
              </div>
              <p className="italic text-[11px] text-red-200 leading-snug">
                "ATTENTION PASSENGERS: The bus is executing an automated safer pull-over due to detected trajectory variance. Please remain seated, hold handrails firmly, and keep aisles clear."
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Cabin Signage:</span>
            <span className="text-amber-300 font-mono font-bold">"REMAIN SEATED · SAFE PULL-OVER"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
