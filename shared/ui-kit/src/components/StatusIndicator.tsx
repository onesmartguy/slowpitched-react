import React from 'react'

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning'
  label?: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const colors = {
    active: '#00ff00',
    inactive: '#ff0000',
    warning: '#ffff00'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div 
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: colors[status]
        }}
      />
      {label && (
        <span style={{ color: '#ccc', fontSize: '14px' }}>
          {label}
        </span>
      )}
    </div>
  )
}

export default StatusIndicator