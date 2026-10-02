/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BusTelemetry,
  IncidentLogItem,
  OverallRiskLevel,
} from './types';
import { evaluateRisk } from './engine/riskEngine';
import {
  INITIAL_BUS_TELEMETRY,
  TELEMETRY_PRESETS,
  EMERGENCY_DEMO_STEPS,
  ROAD_CONTEXTS,
} from './engine/simulationData';

import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ControlRoomDashboard } from './components/ControlRoomDashboard';
import { RoadwaySimulationCanvas } from './components/RoadwaySimulationCanvas';
import { RiskEnginePanel } from './components/RiskEnginePanel';
import { EmergencyModeCard } from './components/EmergencyModeCard';
import { SimulationControls } from './components/SimulationControls';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { IncidentLogTable } from './components/IncidentLogTable';

export default function App() {
  const [telemetry, setTelemetry] = useState<BusTelemetry>(INITIAL_BUS_TELEMETRY);
  const [speedHistory, setSpeedHistory] = useState<number[]>([50, 51, 52, 50, 52, 53, 52]);
  const [laneHistory, setLaneHistory] = useState<number[]>([4, 6, 5, 4, 3, 5, 4]);
  const [logs, setLogs] = useState<IncidentLogItem[]>([]);
  const [autoTickRealism, setAutoTickRealism] = useState<boolean>(true);
  const [isScenarioRunning, setIsScenarioRunning] = useState<boolean>(false);
  const [activeScenarioPhase, setActiveScenarioPhase] = useState<string | null>(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);

  // Compute live context-aware risk
  const riskAssessment = evaluateRisk(telemetry);

  // Keep a reference to the active demo timer timeout list
  const demoTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Update telemetry helper
  const updateTelemetry = useCallback((patch: Partial<BusTelemetry>) => {
    setTelemetry((prev) => ({
      ...prev,
      ...patch,
      timestamp: Date.now(),
    }));
  }, []);

  // Preset applicator
  const applyPreset = useCallback((presetKey: keyof typeof TELEMETRY_PRESETS) => {
    // If a scripted demo was running, cancel it
    demoTimeoutRefs.current.forEach(clearTimeout);
    demoTimeoutRefs.current = [];
    setIsScenarioRunning(false);
    setActiveScenarioPhase(null);

    const preset = TELEMETRY_PRESETS[presetKey];
    if (preset) {
      updateTelemetry(preset.patch);
    }
  }, [updateTelemetry]);

  // Reset simulation to nominal
  const handleResetSimulation = useCallback(() => {
    demoTimeoutRefs.current.forEach(clearTimeout);
    demoTimeoutRefs.current = [];
    setIsScenarioRunning(false);
    setActiveScenarioPhase(null);
    setTelemetry({
      ...INITIAL_BUS_TELEMETRY,
      timestamp: Date.now(),
    });
  }, []);

  // Log incident helper
  const recordIncidentEvent = useCallback((
    riskLevel: OverallRiskLevel,
    score: number,
    summary: string,
    action: string,
    currentTelem: BusTelemetry
  ) => {
    const newLog: IncidentLogItem = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString(),
      busId: currentTelem.busId,
      route: currentTelem.route,
      overallRisk: riskLevel,
      riskScore: score,
      summary,
      speedAtEvent: currentTelem.speedKmH,
      laneOffsetCm: currentTelem.laneDeviationCm,
      passengerLoad: currentTelem.passengerLoad,
      roadRisk: currentTelem.roadRisk,
      actionTaken: action,
      safeStopZone: 'Zone A - Wide Paved Shoulder at KM 14.2',
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // RUN EMERGENCY SCENARIO (Module 9 Demo Requirement)
  const handleRunDemoScenario = useCallback(() => {
    // Clear any previous running sequence
    demoTimeoutRefs.current.forEach(clearTimeout);
    demoTimeoutRefs.current = [];

    setIsScenarioRunning(true);
    let accumulatedTime = 0;

    EMERGENCY_DEMO_STEPS.forEach((step, index) => {
      const timeoutId = setTimeout(() => {
        setActiveScenarioPhase(step.name);
        setTelemetry((prev) => {
          const updated = {
            ...prev,
            ...step.telemetryPatch,
            timestamp: Date.now(),
          };

          // If this step reached high/critical, log it automatically
          if (step.name.includes('Critical') || step.name.includes('Safer Stop Completed')) {
            const evaluated = evaluateRisk(updated);
            recordIncidentEvent(
              evaluated.overallRiskLevel,
              evaluated.riskScore,
              step.description,
              evaluated.recommendedAction,
              updated
            );
          }

          return updated;
        });

        // If last step completed, finish scenario run
        if (index === EMERGENCY_DEMO_STEPS.length - 1) {
          setTimeout(() => {
            setIsScenarioRunning(false);
            setActiveScenarioPhase(null);
          }, 3500);
        }
      }, accumulatedTime);

      demoTimeoutRefs.current.push(timeoutId);
      accumulatedTime += step.durationMs;
    });
  }, [recordIncidentEvent]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      demoTimeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  // Live telemetry subtle tick / jitter (when not running a scripted demo scenario)
  useEffect(() => {
    if (!autoTickRealism || isScenarioRunning) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // If bus is fully stopped, don't jitter speed
        if (prev.speedKmH === 0 && prev.brakingStatus === 'CONTROLLED_DECELERATION') {
          return prev;
        }

        const speedJitter = (Math.random() - 0.49) * 0.8;
        const steerJitter = (Math.random() - 0.5) * 0.4;
        const laneJitter = (Math.random() - 0.5) * 1.2;

        const newSpeed = Math.max(0, Math.min(85, Math.round((prev.speedKmH + speedJitter) * 10) / 10));
        const newSteer = Math.max(-30, Math.min(30, Math.round((prev.steeringAngleDeg + steerJitter) * 10) / 10));
        const newLane = Math.max(-130, Math.min(130, Math.round(prev.laneDeviationCm + laneJitter)));

        // Update sparkline history
        setSpeedHistory((sh) => [...sh.slice(-20), Math.round(newSpeed)]);
        setLaneHistory((lh) => [...lh.slice(-20), newLane]);

        return {
          ...prev,
          speedKmH: newSpeed,
          steeringAngleDeg: newSteer,
          laneDeviationCm: newLane,
          timestamp: Date.now(),
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [autoTickRealism, isScenarioRunning]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header & Mission Control Action Bar */}
      <Header
        overallRisk={riskAssessment.overallRiskLevel}
        riskScore={riskAssessment.riskScore}
        isScenarioRunning={isScenarioRunning}
        activeScenarioPhase={activeScenarioPhase}
        onRunDemoScenario={handleRunDemoScenario}
        onResetSimulation={handleResetSimulation}
        autoTickRealism={autoTickRealism}
        onToggleAutoTick={() => setAutoTickRealism((v) => !v)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
      />

      {/* Safety & Hackathon MVP Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Mission Control Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Module 4: Emergency HUD Banner / Card (prominently shown when emergency is active) */}
        <EmergencyModeCard
          riskAssessment={riskAssessment}
          telemetry={telemetry}
          onAcknowledgeAlert={() => {
            recordIncidentEvent(
              riskAssessment.overallRiskLevel,
              riskAssessment.riskScore,
              'Manual Dispatch Acknowledged by Control Room Operator',
              'Dispatch team assigned',
              telemetry
            );
          }}
        />

        {/* Module 1: Control Room Dashboard (Telemetry, CAN-Bus, Driver, Route, Risk Score) */}
        <ControlRoomDashboard
          telemetry={telemetry}
          riskAssessment={riskAssessment}
          speedHistory={speedHistory}
          laneHistory={laneHistory}
        />

        {/* Two-Column Mid-Section: Module 5 (Safer-Stop Canvas) & Module 3 (Risk Engine Explainability) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Module 5: Visual Safer-Stop Roadway Simulation Canvas */}
          <div className="lg:col-span-7 flex flex-col">
            <RoadwaySimulationCanvas
              telemetry={telemetry}
              riskAssessment={riskAssessment}
              isScenarioRunning={isScenarioRunning}
              activeScenarioPhase={activeScenarioPhase}
            />
          </div>

          {/* Module 3: BUSSHIELD Risk Engine Explainability & Audit Trail */}
          <div className="lg:col-span-5 flex flex-col">
            <RiskEnginePanel
              riskAssessment={riskAssessment}
              telemetry={telemetry}
            />
          </div>
        </div>

        {/* Module 2: Live Telemetry Simulation Controls & Manual Override Sliders */}
        <SimulationControls
          telemetry={telemetry}
          onUpdateTelemetry={updateTelemetry}
          onApplyPreset={applyPreset}
          isScenarioRunning={isScenarioRunning}
        />

        {/* Incident Log & Timeline Table */}
        <IncidentLogTable
          logs={logs}
          onClearLogs={() => setLogs([])}
        />
      </main>

      {/* Module 6: Before vs After Benchmark Comparison Modal */}
      <BeforeAfterComparison
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* Hackathon Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-4 px-4 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">BUSSHIELD AI</span>
            <span>·</span>
            <span>Context-Aware Transportation & Mobility Safety System</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Software-only simulated decision system</span>
            <span>·</span>
            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline"
            >
              View Before vs After Metrics
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
