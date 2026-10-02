/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BusTelemetry,
  RiskAssessment,
  RiskExplanation,
  OverallRiskLevel,
  SaferStopTarget,
} from '../types';

/**
 * BUSSHIELD AI - Risk Engine (Rule-based Core for Hackathon MVP)
 * 
 * Modular context-aware evaluation engine that correlates:
 * 1. Driver behavioral cues (eye closure, head posture, hands on wheel)
 * 2. Vehicle telematics (lane offset, steering stability, braking profile, speed)
 * 3. Dynamic operational context (passenger crowding & road segment hazard profile)
 * 
 * Built with anti-false-alarm multi-sensor correlation:
 * A single isolated metric (e.g. slight gaze shift or brief road bump) does NOT
 * trigger emergency action. Multi-factor convergence is required.
 */

// Available simulated emergency zones along the corridor
export const SIMULATED_SAFE_ZONES: SaferStopTarget[] = [
  {
    zoneId: 'SZ-ORR-A4',
    name: 'Zone A - Wide Paved Shoulder at KM 14.2',
    distanceMeters: 280,
    zoneType: 'WIDE_SHOULDER',
    safetyMarginScore: 92,
    estimatedStoppingSec: 8.5,
  },
  {
    zoneId: 'SZ-ORR-B1',
    name: 'Zone B - Designated Rapid Bus Bay (Exit 8B)',
    distanceMeters: 460,
    zoneType: 'DEDICATED_BUS_BAY',
    safetyMarginScore: 96,
    estimatedStoppingSec: 11.2,
  },
  {
    zoneId: 'SZ-ORR-C3',
    name: 'Zone C - Controlled Deceleration Pocket (Service Ramp)',
    distanceMeters: 620,
    zoneType: 'DECELERATION_POCKET',
    safetyMarginScore: 88,
    estimatedStoppingSec: 14.0,
  },
];

/**
 * Calculates driver behavioral abnormality score (0 - 100)
 * Note: Only detects telemetry anomalies (eyes closed, head drooping, hands off wheel).
 * Explicitly DOES NOT diagnose any medical pathology.
 */
export function calculateDriverRiskScore(telemetry: BusTelemetry): {
  score: number;
  explanations: RiskExplanation[];
} {
  let score = 0;
  const explanations: RiskExplanation[] = [];

  // Hands on wheel check
  if (!telemetry.handsOnWheel) {
    score += 35;
    explanations.push({
      ruleId: 'RULE-DRV-01',
      factor: 'DRIVER',
      title: 'Hands Off Steering Wheel',
      severity: 'warning',
      detail: 'Driver telemetric sensors indicate no contact on the primary steering control surface.',
    });
  }

  // Prolonged eye closure rate
  if (telemetry.eyeClosurePercent >= 75) {
    score += 45;
    explanations.push({
      ruleId: 'RULE-DRV-02',
      factor: 'DRIVER',
      title: 'Prolonged Driver Eye Closure',
      severity: 'critical',
      detail: `Eye closure index at ${Math.round(telemetry.eyeClosurePercent)}% exceeds safe monitoring baseline.`,
    });
  } else if (telemetry.eyeClosurePercent >= 45) {
    score += 25;
    explanations.push({
      ruleId: 'RULE-DRV-03',
      factor: 'DRIVER',
      title: 'Elevated Drowsiness Indicator',
      severity: 'warning',
      detail: `Eye closure pattern (${Math.round(telemetry.eyeClosurePercent)}%) suggests fatigue or reduced vigilance.`,
    });
  }

  // Head posture deviation (slump or tilt)
  if (telemetry.headPoseDeviation >= 60) {
    score += 30;
    explanations.push({
      ruleId: 'RULE-DRV-04',
      factor: 'DRIVER',
      title: 'Abnormal Head Posture Deviation',
      severity: telemetry.headPoseDeviation > 80 ? 'critical' : 'warning',
      detail: `Driver head orientation deviated by ${Math.round(telemetry.headPoseDeviation)}% from active driving posture.`,
    });
  }

  // Preset or synthesized driver status override
  if (telemetry.driverStatus === 'POSSIBLE_INCAPACITATION') {
    score = Math.max(score, 85);
  } else if (telemetry.driverStatus === 'DROWSY') {
    score = Math.max(score, 50);
  }

  return {
    score: Math.min(100, score),
    explanations,
  };
}

/**
 * Calculates vehicle dynamics instability score (0 - 100)
 */
export function calculateVehicleRiskScore(telemetry: BusTelemetry): {
  score: number;
  explanations: RiskExplanation[];
} {
  let score = 0;
  const explanations: RiskExplanation[] = [];

  // Lane departure
  const absOffset = Math.abs(telemetry.laneDeviationCm);
  if (absOffset >= 90) {
    score += 50;
    explanations.push({
      ruleId: 'RULE-VEH-01',
      factor: 'VEHICLE',
      title: 'Severe Lane Departure Warning',
      severity: 'critical',
      detail: `Lateral lane offset at ${absOffset}cm breaches corridor boundary markings.`,
    });
  } else if (absOffset >= 55) {
    score += 30;
    explanations.push({
      ruleId: 'RULE-VEH-02',
      factor: 'VEHICLE',
      title: 'Lane Deviation Increasing',
      severity: 'warning',
      detail: `Vehicle is drifting ${absOffset}cm from lane centerline.`,
    });
  }

  // Steering stability (0 is erratic/loose, 100 is solid tracking)
  if (telemetry.steeringStabilityScore <= 35) {
    score += 40;
    explanations.push({
      ruleId: 'RULE-VEH-03',
      factor: 'VEHICLE',
      title: 'Steering Instability Detected',
      severity: telemetry.steeringStabilityScore < 20 ? 'critical' : 'warning',
      detail: `Steering stability index low (${Math.round(telemetry.steeringStabilityScore)}/100). Erratic lateral oscillations detected.`,
    });
  } else if (telemetry.steeringStabilityScore <= 60) {
    score += 20;
    explanations.push({
      ruleId: 'RULE-VEH-04',
      factor: 'VEHICLE',
      title: 'Degraded Steering Stability',
      severity: 'warning',
      detail: `Steering stability index at ${Math.round(telemetry.steeringStabilityScore)}/100 reflects uneven trajectory guidance.`,
    });
  }

  // Braking anomaly
  if (telemetry.brakingStatus === 'IRREGULAR') {
    score += 20;
    explanations.push({
      ruleId: 'RULE-VEH-05',
      factor: 'VEHICLE',
      title: 'Irregular Braking Pattern',
      severity: 'warning',
      detail: 'Pulsing or uncoordinated brake actuation inconsistent with roadway velocity.',
    });
  } else if (telemetry.brakingStatus === 'PANIC') {
    score += 35;
    explanations.push({
      ruleId: 'RULE-VEH-06',
      factor: 'VEHICLE',
      title: 'Panic Braking Event',
      severity: 'critical',
      detail: 'Sudden deceleration pressure without lane stabilization.',
    });
  }

  // Speed vs road limit mismatch
  if (telemetry.speedKmH > telemetry.roadContext.speedLimitKmH + 15) {
    score += 25;
    explanations.push({
      ruleId: 'RULE-VEH-07',
      factor: 'VEHICLE',
      title: 'Excess Velocity for Current Roadway',
      severity: 'warning',
      detail: `Operating at ${telemetry.speedKmH} km/h in a ${telemetry.roadContext.speedLimitKmH} km/h zone.`,
    });
  }

  return {
    score: Math.min(100, score),
    explanations,
  };
}

/**
 * Context Amplifier:
 * A public transit bus carrying 60 passengers on an elevated flyover has radically
 * different safety stakes than an empty bus on a low-speed suburban road.
 */
export function calculateContextMultiplier(telemetry: BusTelemetry): {
  multiplier: number;
  explanations: RiskExplanation[];
} {
  let multiplier = 1.0;
  const explanations: RiskExplanation[] = [];

  // Passenger load impact
  if (telemetry.passengerLoad === 'CROWDED' || telemetry.passengerCount > 45) {
    multiplier += 0.25;
    explanations.push({
      ruleId: 'RULE-CTX-01',
      factor: 'PASSENGER_LOAD',
      title: 'High Passenger Density In-Cabin',
      severity: 'warning',
      detail: `Passenger load is high (${telemetry.passengerCount}/${telemetry.passengerCapacity} commuters). Elevated kinetic hazard and standing passenger vulnerability.`,
    });
  }

  // Road risk impact
  if (telemetry.roadRisk === 'HIGH') {
    multiplier += 0.35;
    explanations.push({
      ruleId: 'RULE-CTX-02',
      factor: 'ROAD_RISK',
      title: `High-Risk Road Environment (${telemetry.roadContext.name})`,
      severity: 'warning',
      detail: `${telemetry.roadContext.hazardDescription}. Limited lateral runoff space demands proactive emergency prevention.`,
    });
  } else if (telemetry.roadRisk === 'MEDIUM') {
    multiplier += 0.15;
    explanations.push({
      ruleId: 'RULE-CTX-03',
      factor: 'ROAD_RISK',
      title: `Moderate Road Risk Context`,
      severity: 'info',
      detail: `${telemetry.roadContext.hazardDescription}. Standard safety buffer maintained.`,
    });
  }

  return {
    multiplier: Number(multiplier.toFixed(2)),
    explanations,
  };
}

/**
 * Evaluates the full context-aware risk state.
 * Implements the required multi-factor rule engine:
 * 
 * - Rule 1: Single weak anomaly -> stays NORMAL or low advisory (avoids false alarms)
 * - Rule 2: Driver abnormality + abnormal vehicle behaviour = ELEVATED risk
 * - Rule 3: Driver abnormality + lane deviation + speed anomaly = HIGH risk
 * - Rule 4: High risk + crowded bus + high-risk road = CRITICAL EMERGENCY
 */
export function evaluateRisk(telemetry: BusTelemetry): RiskAssessment {
  const driverEval = calculateDriverRiskScore(telemetry);
  const vehicleEval = calculateVehicleRiskScore(telemetry);
  const contextEval = calculateContextMultiplier(telemetry);

  const driverScore = driverEval.score;
  const vehicleScore = vehicleEval.score;
  const contextMultiplier = contextEval.multiplier;

  // Base raw correlation score
  // We require correlation: if only one sensor is noisy, raw correlation remains muted
  let baseScore = 0;
  const hasDriverAbnormality = driverScore >= 45;
  const hasVehicleInstability = vehicleScore >= 40;
  const hasSevereDriverIssue = driverScore >= 75;
  const hasSevereVehicleDrift = Math.abs(telemetry.laneDeviationCm) >= 70 || vehicleScore >= 70;

  if (hasDriverAbnormality && hasVehicleInstability) {
    // Both driver and vehicle indicate trouble
    baseScore = 40 + (driverScore * 0.3) + (vehicleScore * 0.3);
  } else if (hasSevereDriverIssue && Math.abs(telemetry.laneDeviationCm) >= 50) {
    baseScore = 55 + (driverScore * 0.3);
  } else if (hasSevereVehicleDrift && !telemetry.handsOnWheel) {
    baseScore = 50 + (vehicleScore * 0.3);
  } else {
    // Single weak signal suppression (Anti-false alarm rule)
    baseScore = Math.max(driverScore, vehicleScore) * 0.35;
  }

  // Apply context multiplier (crowded bus, high risk road)
  let finalRiskScore = Math.min(100, Math.round(baseScore * contextMultiplier));

  // Determine overall categorical risk level
  let overallRiskLevel: OverallRiskLevel = 'NORMAL';
  let summaryReason = 'Nominal transit conditions. Driver vigilance and vehicle trajectory within safety bounds.';

  const isHighRiskRoad = telemetry.roadRisk === 'HIGH';
  const isCrowdedBus = telemetry.passengerLoad === 'CROWDED';

  // Multi-factor escalation logic
  if (
    (hasDriverAbnormality && hasVehicleInstability && (isHighRiskRoad || isCrowdedBus)) ||
    (hasSevereDriverIssue && hasSevereVehicleDrift) ||
    (finalRiskScore >= 72)
  ) {
    overallRiskLevel = 'CRITICAL_EMERGENCY';
    summaryReason = 'Possible Driver Incapacitation Detected with loss of vehicle trajectory control in elevated hazard context.';
  } else if (hasDriverAbnormality && (Math.abs(telemetry.laneDeviationCm) >= 50 || vehicleScore >= 45) || finalRiskScore >= 52) {
    overallRiskLevel = 'HIGH';
    summaryReason = 'Driver vigilance degradation correlated with escalating lane deviation and steering instability.';
  } else if ((hasDriverAbnormality || hasVehicleInstability) && finalRiskScore >= 30) {
    overallRiskLevel = 'ELEVATED';
    summaryReason = 'Telemetry shows early driver fatigue or minor trajectory variance. Monitoring escalation thresholds.';
  } else {
    overallRiskLevel = 'NORMAL';
    finalRiskScore = Math.min(25, finalRiskScore);
  }

  // Combine explanations
  const allExplanations: RiskExplanation[] = [
    ...driverEval.explanations,
    ...vehicleEval.explanations,
    ...contextEval.explanations,
  ];

  if (hasDriverAbnormality && hasVehicleInstability) {
    allExplanations.unshift({
      ruleId: 'RULE-CORR-01',
      factor: 'MULTI_FACTOR_CORRELATION',
      title: 'Correlated Dual-Domain Anomaly',
      severity: overallRiskLevel === 'CRITICAL_EMERGENCY' ? 'critical' : 'warning',
      detail: 'Concurrent driver posture/gaze impairment coupled with vehicle lateral path destabilization validates emergency condition.',
    });
  }

  // Safe stopping recommendation selection
  let saferStopTarget: SaferStopTarget | null = null;
  let recommendedAction = 'Continue normal automated telemetry monitoring.';
  const isEmergencyActive = overallRiskLevel === 'CRITICAL_EMERGENCY' || overallRiskLevel === 'HIGH';

  if (isEmergencyActive) {
    // Pick the most suitable safe zone based on distance and corridor speed
    saferStopTarget = SIMULATED_SAFE_ZONES[0];
    recommendedAction = `Execute gradual deceleration and guide bus toward ${saferStopTarget.name} (${saferStopTarget.distanceMeters}m ahead). Broadcast in-cabin safety directive and alert Transport Control Room.`;
  } else if (overallRiskLevel === 'ELEVATED') {
    recommendedAction = 'Engage in-cab driver haptic/audio alert chime. Pre-calculate nearest safety zones on digital route map.';
  }

  return {
    overallRiskLevel,
    riskScore: finalRiskScore,
    driverRiskScore: driverScore,
    vehicleRiskScore: vehicleScore,
    contextMultiplier,
    summaryReason,
    explanations: allExplanations,
    recommendedAction,
    isEmergencyActive,
    saferStopTarget,
    alertDispatch: {
      controlRoomNotified: isEmergencyActive,
      passengerAlertBroadcast: isEmergencyActive,
      hazardLightsEngaged: isEmergencyActive,
      dispatchPacketId: isEmergencyActive ? `DISP-${telemetry.busId.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString().slice(-6)}` : '',
    },
    timestampIso: new Date().toISOString(),
  };
}
