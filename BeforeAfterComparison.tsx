/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BENCHMARK_COMPARISON_DATA } from '../engine/simulationData';
import {
  BarChart3,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
} from 'lucide-react';

interface BeforeAfterComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  isOpen,
  onClose,
}) => {
  const [isRunningBench, setIsRunningBench] = useState(false);
  const [benchProgress, setBenchProgress] = useState(100);
  const [activeCycle, setActiveCycle] = useState<number>(1);

  if (!isOpen) return null;

  const handleRunBenchmark = () => {
    setIsRunningBench(true);
    setBenchProgress(0);

    const interval = setInterval(() => {
      setBenchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningBench(false);
          setActiveCycle((c) => c + 1);
          return 100;
        }
        return prev + 10;
      });
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Comparative Impact: Before vs After BUSSHIELD AI
              </h2>
              <p className="text-xs text-slate-400">
                Simulated response benchmarks for emergency decision system evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar & Disclaimer */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunBenchmark}
                disabled={isRunningBench}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800/40 text-white rounded text-xs font-semibold shadow transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningBench ? `Evaluating Scenario... ${benchProgress}%` : 'Run Comparative Benchmark Run'}</span>
              </button>
              <span className="text-xs font-mono text-slate-400">
                Cycle #{activeCycle} · Correlated 50km/h highway baseline
              </span>
            </div>

            {/* Clear simulated label */}
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-950/40 px-2.5 py-1 rounded border border-amber-700/50">
              <Info className="w-3.5 h-3.5" />
              <span>Simulated Synthetic Benchmark Results</span>
            </div>
          </div>

          {/* Progress bar when running */}
          {isRunningBench && (
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-150"
                style={{ width: `${benchProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Main Content Grid: Benchmark Comparison Table */}
        <div className="p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Performance Metric</th>
                  <th className="py-2.5 px-3 text-red-400">Conventional Unassisted (Before)</th>
                  <th className="py-2.5 px-3 text-cyan-400">BUSSHIELD AI Context-Aware (After)</th>
                  <th className="py-2.5 px-3 text-emerald-400">Simulated Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {BENCHMARK_COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                      {row.metric}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-red-400 font-bold text-sm">
                        {row.withoutBusShield}
                      </div>
                      <div className="font-sans text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {row.withoutNote}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-cyan-300 font-bold text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        {row.withBusShield}
                      </div>
                      <div className="font-sans text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {row.withNote}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-bold text-xs">
                        {row.improvement}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Architectural Takeaways for Hackathon Judges */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Core System Engineering Highlights:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 pt-1 text-[11px]">
              <div>
                <strong className="text-slate-300">1. Proactive vs Reactive Horizon:</strong>
                <p className="mt-0.5">
                  Standard systems rely on violent curb strike or manual panic switches. BUSSHIELD AI integrates gaze + steering entropy within ~2.6s, before kinetic boundary breach occurs.
                </p>
              </div>
              <div>
                <strong className="text-slate-300">2. Context-Conditioned Deceleration:</strong>
                <p className="mt-0.5">
                  Does not slam emergency brakes in high-speed traffic (which causes passenger tumble injuries). Selects GIS-designated paved shoulder bays with progressive deceleration curves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* Clearly labeled simulated results generated for Hackathon MVP demonstration.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
