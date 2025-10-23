# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pitch Height Tracker Pro** - A mobile React Native app for tracking pitch heights in baseball/softball using computer vision. The app uses VisionCamera with YUV color detection to track yellow ball positions and calculate pitch heights with calibration and uncertainty measurements.

## Technology Stack

- **Framework**: React Native with Expo
- **Camera**: VisionCamera for real-time tracking
- **Storage**: SQLite/AsyncStorage for pitch logging
- **Language**: TypeScript
- **Color Detection**: YUV color space for yellow ball gating

## Repository Structure

The project follows a monorepo structure:

- `/apps` - Mobile application code
- `/shared` - Shared utilities and components
- `/.github/workflows` - CI/CD pipelines (build.yml, test.yml, release.yml)
- `/docs` - Project documentation including MVP_PLAN.md

## Development Commands

_Note: This repository is currently in initial setup phase. Package.json and build scripts will be added during Phase 1._

Expected commands once setup is complete:

- Build: `pnpm run build` or `expo build`
- Test: `pnpm test`
- Start development: `expo start` or `pnpm start`
- Lint: `pnpm run lint`

## Core Architecture

### 1. Tracking Pipeline

- **ROI (Region of Interest)**: Draggable component for defining tracking area
- **Color Gating**: YUV-based yellow ball detection for filtering
- **Calibration System**: Quality meter with uncertainty calculations and animated coach overlay
- **Real-time Processing**: VisionCamera frame processing for position tracking

### 2. Data Model

The pitch data model includes:

- Pitch height measurements
- Calibration uncertainty values
- Session metadata for grouping pitches
- Timestamp and tracking quality metrics

### 3. Storage & Export

- SQLite/AsyncStorage for local pitch persistence
- Session-based organization
- CSV export with native share sheet integration
- Statistical aggregation (min/avg/max, variance)

### 4. Agentic AI Integration

The project includes hooks for automated workflows:

- MCP server endpoints for external tooling
- Automated build/test/release pipelines
- Telemetry and analytics integration
- Agent workflow documentation

## Implementation Phases

The project is being built in 5 phases:

1. Repository structure and setup
2. Core tracking features (ROI, VisionCamera, color detection, calibration)
3. Data layer with pitch logging and uncertainty calculations
4. Dashboard with statistics and CSV export
5. Agentic AI integration for automation

## Key Technical Considerations

### Camera Integration

- VisionCamera is the primary camera interface
- Frame processing must handle real-time YUV color space conversion
- ROI component must be performant and responsive to drag gestures

### Calibration System

- Uncertainty measurements are critical for data quality
- Calibration coach provides user feedback through animated overlays
- Quality meter must be visible during tracking sessions

### Data Integrity

- All pitch measurements include uncertainty values
- Session-based organization allows filtering and comparison
- Export functionality must preserve data fidelity for analysis

## Current Status

This repository is in the initial setup phase. The README.md contains the MVP implementation plan with a detailed checklist covering all 5 phases of development.
