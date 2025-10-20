import React, { useEffect, useRef } from 'react'

interface LoggerProps {
  logs: string[]
}

const Logger: React.FC<LoggerProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div>
      <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Activity Log</h4>
      <div 
        ref={logContainerRef}
        className="log-container"
        style={{
          background: '#000',
          color: '#0f0',
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          height: '200px',
          overflowY: 'auto',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>No activity logged yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Logger