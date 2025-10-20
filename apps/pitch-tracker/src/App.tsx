import { useState, useRef, useCallback } from 'react'
import VideoPlayer from './components/VideoPlayer'
import ControlsPanel from './components/ControlsPanel'
import Logger from './components/Logger'
import { PitchData, ROIPosition } from './types'

function App() {
  const [isTracking, setIsTracking] = useState(false)
  const [roi, setRoi] = useState<ROIPosition>({ x: 100, y: 100, width: 200, height: 150 })
  const [pitchData, setPitchData] = useState<PitchData[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }, [])

  const handleStartTracking = () => {
    setIsTracking(true)
    addLog('Tracking started')
  }

  const handleStopTracking = () => {
    setIsTracking(false)
    addLog('Tracking stopped')
  }

  const handleExportData = () => {
    if (pitchData.length === 0) {
      addLog('No data to export')
      return
    }

    const csv = [
      'timestamp,height,velocity,x_position,y_position',
      ...pitchData.map(data => 
        `${data.timestamp},${data.height},${data.velocity},${data.x},${data.y}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pitch_data_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    addLog(`Exported ${pitchData.length} data points`)
  }

  return (
    <div className="app-container">
      <div className="video-container">
        <VideoPlayer
          ref={videoRef}
          roi={roi}
          onROIChange={setRoi}
          isTracking={isTracking}
          onPitchDetected={(data) => {
            setPitchData(prev => [...prev, data])
            addLog(`Pitch detected: Height ${data.height.toFixed(1)}ft, Velocity ${data.velocity.toFixed(1)}mph`)
          }}
        />
      </div>
      
      <div className="controls-panel">
        <ControlsPanel
          isTracking={isTracking}
          onStartTracking={handleStartTracking}
          onStopTracking={handleStopTracking}
          onExportData={handleExportData}
          pitchCount={pitchData.length}
        />
        
        <Logger logs={logs} />
      </div>
    </div>
  )
}

export default App