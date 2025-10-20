import React from 'react'

interface ControlsPanelProps {
  isTracking: boolean
  onStartTracking: () => void
  onStopTracking: () => void
  onExportData: () => void
  pitchCount: number
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isTracking,
  onStartTracking,
  onStopTracking,
  onExportData,
  pitchCount
}) => {
  return (
    <div>
      <h3 style={{ color: '#fff', marginTop: 0 }}>Pitch Tracker Controls</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ color: '#ccc', fontSize: '14px', marginBottom: '0.5rem' }}>
          Status: 
          <span className={`status-indicator ${isTracking ? 'status-active' : 'status-inactive'}`}></span>
          {isTracking ? 'Tracking Active' : 'Standby'}
        </div>
        
        <div style={{ color: '#ccc', fontSize: '14px' }}>
          Pitches Detected: <strong style={{ color: '#fff' }}>{pitchCount}</strong>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {!isTracking ? (
          <button onClick={onStartTracking}>
            Start Tracking
          </button>
        ) : (
          <button onClick={onStopTracking} style={{ background: '#ff4444' }}>
            Stop Tracking
          </button>
        )}
        
        <button 
          onClick={onExportData} 
          disabled={pitchCount === 0}
          style={{ 
            opacity: pitchCount === 0 ? 0.5 : 1,
            cursor: pitchCount === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Export CSV ({pitchCount} records)
        </button>
        
        <button onClick={() => window.location.reload()}>
          Reset Session
        </button>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#333', borderRadius: '4px' }}>
        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '14px' }}>Settings</h4>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ color: '#ccc', fontSize: '12px', display: 'block', marginBottom: '0.25rem' }}>
            Yellow Sensitivity
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="75" 
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ color: '#ccc', fontSize: '12px', display: 'block', marginBottom: '0.25rem' }}>
            Motion Threshold
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="50" 
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ color: '#ccc', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} />
            Auto-calibrate
          </label>
        </div>
      </div>
    </div>
  )
}

export default ControlsPanel