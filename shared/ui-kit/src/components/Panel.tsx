import React from 'react'

interface PanelProps {
  children: React.ReactNode
  title?: string
  className?: string
}

const Panel: React.FC<PanelProps> = ({ children, title, className = '' }) => {
  return (
    <div 
      className={`panel ${className}`}
      style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid #333'
      }}
    >
      {title && (
        <h3 style={{ 
          color: '#fff', 
          marginTop: 0, 
          marginBottom: '1rem',
          fontSize: '1.1em',
          borderBottom: '1px solid #333',
          paddingBottom: '0.5rem'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default Panel