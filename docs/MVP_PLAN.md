# Pitch Height Tracker Pro - MVP Plan

## Overview
A React-based application for tracking softball pitch heights with computer vision capabilities.

## Features
- **Draggable ROI**: Interactive region of interest selection for pitch tracking
- **Yellow-ball gating**: Color-based ball detection and filtering
- **Calibration meter**: Visual reference for accurate height measurements
- **Logger**: Real-time data capture and storage
- **CSV export**: Data export functionality for analysis

## Development Phases

### Phase 1: Core Tracking (ROI + Meter)
- [ ] Set up React application structure
- [ ] Implement draggable ROI component
- [ ] Create calibration meter component
- [ ] Basic video/image processing pipeline

### Phase 2: Data Layer (SQLite + Logs)
- [ ] Integrate SQLite database
- [ ] Implement logging system
- [ ] Data persistence layer
- [ ] Real-time data capture

### Phase 3: Dashboard/Export
- [ ] Create dashboard interface
- [ ] Implement CSV export functionality
- [ ] Data visualization components
- [ ] Analytics and reporting

### Phase 4: Agentic CI/CD
- [ ] GitHub Actions workflows
- [ ] Automated testing
- [ ] Deployment pipeline
- [ ] Code quality checks

## Technology Stack
- **Frontend**: React, TypeScript
- **Data**: SQLite, IndexedDB
- **Processing**: Canvas API, Web Workers
- **Build**: Vite, ESLint, Prettier
- **CI/CD**: GitHub Actions