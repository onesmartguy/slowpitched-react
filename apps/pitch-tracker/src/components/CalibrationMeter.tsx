import React from 'react'

interface CalibrationMeterProps {
  minHeight?: number
  maxHeight?: number
}

const CalibrationMeter: React.FC<CalibrationMeterProps> = ({ 
  minHeight = 2, 
  maxHeight = 6 
}) => {
  const ticks = []
  const range = maxHeight - minHeight
  const tickCount = range * 2 // Half-foot increments
  
  for (let i = 0; i <= tickCount; i++) {
    const height = minHeight + (i / tickCount) * range
    const isFullFoot = height % 1 === 0
    
    ticks.push(
      <div key={i} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '3px',
        height: '8px'
      }}>
        <div 
          className="meter-tick"
          style={{
            width: isFullFoot ? '20px' : '12px',
            height: '2px',
            background: '#fff',
            marginRight: '5px'
          }}
        />
        {isFullFoot && (
          <span className="meter-label" style={{ 
            color: '#fff', 
            fontSize: '10px',
            minWidth: '20px'
          }}>
            {height}ft
          </span>
        )}
      </div>
    )
  }

  return (
    <div 
      className="calibration-meter"
      style={{
        position: 'absolute',
        right: 10,
        top: 10,
        width: '60px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '4px',
        padding: '10px 5px',
        border: '1px solid #555'
      }}
    >
      <div style={{ 
        color: '#fff', 
        fontSize: '10px', 
        textAlign: 'center', 
        marginBottom: '8px',
        fontWeight: 'bold'
      }}>
        HEIGHT
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
        {ticks}
      </div>
      
      <div style={{
        marginTop: '8px',
        padding: '4px',
        background: 'rgba(0, 255, 0, 0.2)',
        borderRadius: '2px',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: '#0f0', 
          fontSize: '8px',
          fontWeight: 'bold'
        }}>
          CALIBRATED
        </div>
      </div>
    </div>
  )
}

export default CalibrationMeter