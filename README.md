# BUSSHIELD AI

### Context-Aware Emergency Decision System for Public Buses

BUSSHIELD AI is a software-only safety decision system designed to demonstrate how a public bus could respond to a possible driver incapacitation or loss-of-control event.

The MVP uses simulated driver and vehicle telemetry. It does not diagnose medical conditions and does not control a real vehicle.

## Problem Statement

A sudden loss of driver control in a public bus can create a critical safety situation for passengers and other road users.

The challenge is not only detecting abnormal driver or vehicle behaviour, but also determining an appropriate emergency response based on the surrounding situation.

Factors such as passenger crowd level and road risk can change the severity of an incident.

## Proposed Solution

BUSSHIELD AI combines multiple simulated signals into a transparent, context-aware risk assessment:

**Driver Behaviour + Vehicle Behaviour + Passenger Load + Road Risk → Risk Assessment → Emergency Response**

Instead of triggering an emergency from a single weak signal, the MVP requires multiple abnormal conditions before escalating the risk.

## Key Features

- Real-time simulated bus telemetry
- Driver behaviour monitoring
- Vehicle speed and steering monitoring
- Lane deviation monitoring
- Braking-status monitoring
- Passenger crowd-level assessment
- Road-risk assessment
- Transparent rule-based risk engine
- Explainable risk triggers
- Emergency response mode
- Simulated safer-stop recommendation
- Control-room alert simulation
- Passenger safety alert simulation
- Incident/event logging
- Before-vs-after simulated benchmark
- One-click emergency scenario demonstration
- Reset simulation

## Risk Engine

The MVP uses a modular rule-based risk engine.

Examples:

- Driver abnormality + abnormal vehicle behaviour → elevated risk
- Driver abnormality + lane deviation + abnormal speed → high risk
- High risk + crowded bus + high-risk road → critical emergency

The system suppresses emergency escalation from isolated weak signals to reduce false triggers.

The architecture is modular so that the rule-based engine can later be replaced or extended with a machine-learning model.

## Emergency Scenario

The demo can automatically simulate:

1. Normal driving
2. Driver abnormality
3. Vehicle instability
4. Risk escalation
5. Critical emergency detection
6. Safer-stop recommendation
7. Control-room and passenger alerts
8. Incident logging

## Safer-Stop Simulation

The MVP visually demonstrates:

**Current Bus → Detected Risk → Response Decision → Safer Stop**

The safer-stop process is simulated only.

The prototype does **not** implement real vehicle steering, braking, or autonomous control.

## Technology Stack

- React
- TypeScript
- Vite
- HTML5 Canvas
- CSS
- Rule-based risk engine
- Simulated vehicle telemetry

## Data

All vehicle, driver, passenger and road telemetry used by this MVP is simulated for demonstration and testing.

No real medical diagnosis is performed.

No real vehicle-control system is connected.

## Before vs After Evaluation

The application includes a synthetic benchmark comparing an unassisted scenario with the BUSSHIELD AI response.

Metrics include:

- Anomaly detection time
- Emergency response time
- Stopping distance
- Residual speed
- False-trigger count

**Important:** These benchmark values are simulated synthetic results for the MVP demonstration and are not real-world measured performance.

## Live Demo

https://busshield-ai.ai.studio

## Project Structure

```text
src/
├── components/
│   ├── BeforeAfterComparison.tsx
│   ├── ControlRoomDashboard.tsx
│   ├── DisclaimerBanner.tsx
│   ├── EmergencyModeCard.tsx
│   ├── Header.tsx
│   ├── IncidentLogTable.tsx
│   ├── RiskEnginePanel.tsx
│   ├── RoadwaySimulationCanvas.tsx
│   └── SimulationControls.tsx
├── engine/
│   ├── riskEngine.ts
│   └── simulationData.ts
├── App.tsx
├── main.tsx
├── index.css
└── types.ts
```

## Safety & MVP Limitations

BUSSHIELD AI is a hackathon software prototype.

It detects **possible driver incapacitation or loss of vehicle control** from simulated signals. It does not determine whether a driver is experiencing a heart attack, stroke, paralysis, or any other medical condition.

A real-world deployment would require validated sensors, certified automotive interfaces, functional-safety engineering, redundancy, regulatory approval, and extensive testing.

## Team

**Team MOBIVAULT**

### Repository

This repository contains the software prototype and supporting project documentation for BUSSHIELD AI.
