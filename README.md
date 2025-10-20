# Pitch Height Tracker Pro

A React-based application for tracking softball pitch heights with computer vision capabilities.

![MVP Status](https://img.shields.io/badge/MVP-Complete-green)
![Phase 1](https://img.shields.io/badge/Phase%201-Complete-green)
![Phase 2](https://img.shields.io/badge/Phase%202-Complete-green)

## Features

✅ **Draggable ROI**: Interactive region of interest selection for pitch tracking  
✅ **Yellow-ball gating**: Color-based ball detection and filtering  
✅ **Calibration meter**: Visual reference for accurate height measurements  
✅ **Logger**: Real-time data capture and storage  
✅ **CSV export**: Data export functionality for analysis  
✅ **Data persistence**: IndexedDB integration for local storage  

## Screenshots

### Initial State
![Pitch Tracker Initial State](https://github.com/user-attachments/assets/9f413e59-1511-407b-b3c5-863c758c754b)

### Active Tracking
![Active Tracking with Detected Pitches](https://github.com/user-attachments/assets/8d708169-7147-4215-bb75-b42d48651d58)

## Project Structure

```
├── apps/
│   └── pitch-tracker/          # Main React application
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── services/       # Database and API services
│       │   ├── hooks/          # Custom React hooks
│       │   └── types.ts        # TypeScript definitions
│       └── package.json
├── shared/
│   └── ui-kit/                # Shared UI components
│       ├── src/components/
│       └── package.json
├── .github/workflows/         # CI/CD pipelines
└── docs/MVP_PLAN.md          # Detailed project plan

```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Build shared UI kit
npm run build --workspace=shared/ui-kit

# Start development server
npm run dev --workspace=apps/pitch-tracker
```

### Building for Production

```bash
# Build all packages
npm run build

# Build specific workspace
npm run build --workspace=apps/pitch-tracker
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Custom CSS, React Draggable
- **Data**: IndexedDB for local persistence
- **Processing**: Canvas API for image processing
- **Build**: Vite, ESLint, TypeScript
- **CI/CD**: GitHub Actions

## MVP Development Phases

### ✅ Phase 1: Core Tracking (ROI + Meter)
- Interactive draggable ROI component
- Calibration meter with height reference
- Basic pitch detection simulation
- Real-time tracking status

### ✅ Phase 2: Data Layer (IndexedDB + Logs)
- IndexedDB integration for data persistence
- Comprehensive logging system
- Statistics calculation
- Data management utilities

### 🔄 Phase 3: Dashboard/Export (In Progress)
- Enhanced dashboard interface
- Advanced CSV export functionality
- Data visualization components
- Analytics and reporting

### 📋 Phase 4: Agentic CI/CD (Planned)
- GitHub Actions workflows
- Automated testing pipeline
- Deployment automation
- Code quality checks

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is private and proprietary.