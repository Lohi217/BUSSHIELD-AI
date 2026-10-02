/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IncidentLogItem, OverallRiskLevel } from '../types';
import { FileText, Clock, AlertTriangle, ShieldCheck, Download, Trash2 } from 'lucide-react';

interface IncidentLogTableProps {
  logs: IncidentLogItem[];
  onClearLogs: () => void;
}

export const IncidentLogTable: React.FC<IncidentLogTableProps> = ({ logs, onClearLogs }) => {
  const downloadLogJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BUSSHIELD-incident-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRiskBadge = (risk: OverallRiskLevel) => {
    switch (risk) {
      case 'CRITICAL_EMERGENCY':
        return (
          <span className="text-red-400 font-bold text-[11px] px-2 py-0.5 rounded bg-red-950/60 border border-red-800">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-amber-400 font-semibold text-[11px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
            HIGH RISK
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="text-yellow-400 font-medium text-[11px] px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-800">
            ELEVATED
          </span>
        );
      default:
        return (
          <span className="text-emerald-400 font-normal text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
            NOMINAL
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Transport Control Room Incident & Telemetry Event Log
            </h2>
            <p className="text-xs text-slate-400">
              Audit trail of detected anomalies, dispatch packets, and safer-stop executions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadLogJson}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
            title="Export simulated JSON incident logs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Log</span>
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-red-300 bg-slate-800/60 hover:bg-red-950/40 disabled:opacity-40 rounded transition-colors"
            title="Clear all event logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto max-h-60 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            No incident events recorded. Trigger a simulation scenario or emergency condition to log events.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2 px-2.5">Time</th>
                <th className="py-2 px-2.5">Bus / Route</th>
                <th className="py-2 px-2.5">Risk State</th>
                <th className="py-2 px-2.5">Score</th>
                <th className="py-2 px-2.5">Telemetry at Trigger</th>
                <th className="py-2 px-2.5">Summary & Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-2.5 text-slate-400 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    <span className="text-white font-bold">{item.busId}</span>
                    <span className="text-[10px] text-slate-500 block">{item.route.split('(')[0]}</span>
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    {getRiskBadge(item.overallRisk)}
                  </td>
                  <td className="py-2.5 px-2.5 font-bold text-slate-200">
                    {item.riskScore}/100
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-300">
                    <span>{item.speedAtEvent} km/h</span> ·{' '}
                    <span className={Math.abs(item.laneOffsetCm) > 50 ? 'text-amber-400' : 'text-slate-400'}>
                      {item.laneOffsetCm > 0 ? `+${item.laneOffsetCm}` : item.laneOffsetCm}cm drift
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.passengerLoad} · Road {item.roadRisk}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 font-sans">
                    <div className="text-slate-200 font-medium line-clamp-1">
                      {item.summary}
                    </div>
                    <div className="text-[11px] text-cyan-400 mt-0.5 line-clamp-1">
                      ↳ {item.actionTaken}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
