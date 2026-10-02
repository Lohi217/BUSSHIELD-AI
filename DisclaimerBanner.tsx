/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
          <p className="truncate">
            <strong className="text-slate-300 font-semibold">HACKATHON MVP PROTOTYPE:</strong> Software-only simulated decision system. Uses simulated vehicle telemetry and driver attention metrics. Does not provide medical diagnoses or actuate physical bus controls.
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 font-medium"
        >
          <span>{expanded ? 'Less Info' : 'Guardrails & Ethics'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 py-2.5 border-t border-slate-900 bg-slate-950/90 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Non-Diagnostic Boundary:</span>
              <p className="mt-0.5">Detects observable telemetric cues (gaze closure, head pose, grip loss). Does NOT diagnose medical conditions (stroke, heart attack, or paralysis).</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Advisory & Safer-Stop Simulation:</span>
              <p className="mt-0.5">Calculates safe stopping corridors and dispatch packets. Physical vehicle braking and steering are simulated in software only.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Context-Aware Multi-Factor Engine:</span>
              <p className="mt-0.5">Prevents single-sensor false triggers by weighting vehicle trajectory against passenger density and roadway hazard tiers.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
