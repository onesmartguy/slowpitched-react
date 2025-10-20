import React from 'react'

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning'
  label?: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const colors = {
    active: '#22c55e', // More accessible green
    inactive: '#ef4444', // More accessible red
    warning: '#f59e0b'  // More accessible amber
  }

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive', 
    warning: 'Warning'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div 
        role="status"
        aria-label={`Status: ${statusLabels[status]}`}
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