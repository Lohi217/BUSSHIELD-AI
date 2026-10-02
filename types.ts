/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DriverStatus = 'NORMAL' | 'DROWSY' | 'POSSIBLE_INCAPACITATION';
export type PassengerLoad = 'NORMAL' | 'CROWDED';
export type RoadRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type BrakingStatus = 'NONE' | 'NORMAL' | 'IRREGULAR' | 'PANIC' | 'CONTROLLED_DECELERATION';
export type OverallRiskLevel = 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL_EMERGENCY';

export type RoadRiskType = 
  | 'URBAN_ARTERIAL' 
  | 'EXPRESSWAY' 
  | 'ELEVATED_FLYOVER' 
  | 'GHAT_SECTION' 
  | 'HIGH_PEDESTRIAN_ZONE';

export interface RoadRiskContext {
  type: RoadRiskType;
  name: string;
  speedLimitKmH: number;
  hazardDescription: string;
  shoulderAvailability: 'WIDE_EMERGENCY_SHOULDER' | 'DESIGNATED_BUS_BAY' | 'NARROW_BARRIER_ONLY';
}

export interface BusTelemetry {
  busId: string;
  route: string;
  driverName: string;
  speedKmH: number;
  steeringAngleDeg: number;       // negative = left, positive = right
  steeringStabilityScore: number; // 0 (wild erratic/loose) to 100 (smooth track)
  laneDeviationCm: number;        // 0 is centered, +/- 80cm crosses lane markings
  brakingStatus: BrakingStatus;
  driverStatus: DriverStatus;
  eyeClosurePercent: number;     // 0 - 100%
  headPoseDeviation: number;     // 0 - 100%
  handsOnWheel: boolean;
  passengerLoad: PassengerLoad;
  passengerCount: number;        // e.g. 26 vs 62
  passengerCapacity: number;     // 60
  roadRisk: RoadRiskLevel;
  roadContext: RoadRiskContext;
  hazardLightsActive: boolean;
  acousticWarningActive: boolean;
  timestamp: number;
}

export interface RiskExplanation {
  ruleId: string;
  factor: 'DRIVER' | 'VEHICLE' | 'PASSENGER_LOAD' | 'ROAD_RISK' | 'MULTI_FACTOR_CORRELATION';
  title: string;
  severity: 'info' | 'warning' | 'critical';
  detail: string;
}

export interface SaferStopTarget {
  zoneId: string;
  name: string;
  distanceMeters: number;
  zoneType: 'WIDE_SHOULDER' | 'DEDICATED_BUS_BAY' | 'DECELERATION_POCKET';
  safetyMarginScore: number; // 0 - 100
  estimatedStoppingSec: number;
}

export interface RiskAssessment {
  overallRiskLevel: OverallRiskLevel;
  riskScore: number; // 0 - 100
  driverRiskScore: number; // 0 - 100
  vehicleRiskScore: number; // 0 - 100
  contextMultiplier: number; // 1.0 to 1.6
  summaryReason: string;
  explanations: RiskExplanation[];
  recommendedAction: string;
  isEmergencyActive: boolean;
  saferStopTarget: SaferStopTarget | null;
  alertDispatch: {
    controlRoomNotified: boolean;
    passengerAlertBroadcast: boolean;
    hazardLightsEngaged: boolean;
    dispatchPacketId: string;
  };
  timestampIso: string;
}

export interface IncidentLogItem {
  id: string;
  timestamp: string;
  busId: string;
  route: string;
  overallRisk: OverallRiskLevel;
  riskScore: number;
  summary: string;
  speedAtEvent: number;
  laneOffsetCm: number;
  passengerLoad: PassengerLoad;
  roadRisk: RoadRiskLevel;
  actionTaken: string;
  safeStopZone: string;
}

export interface ScenarioPhase {
  name: string;
  description: string;
  durationMs: number;
  telemetryPatch: Partial<BusTelemetry>;
}
