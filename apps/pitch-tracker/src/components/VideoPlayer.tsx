import { forwardRef, useRef, useEffect, useCallback } from 'react'
import DraggableROI from './DraggableROI'
import CalibrationMeter from './CalibrationMeter'
import { ROIPosition, PitchData } from '../types'

interface VideoPlayerProps {
  roi: ROIPosition
  onROIChange: (roi: ROIPosition) => void
  isTracking: boolean
  onPitchDetected: (data: PitchData) => void
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ roi, onROIChange, isTracking, onPitchDetected }, _ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Mock video dimensions for demonstration
    const VIDEO_WIDTH = 640
    const VIDEO_HEIGHT = 480

    const detectYellowBall = useCallback((imageData: ImageData, roi: ROIPosition) => {
      // Simple yellow ball detection algorithm
      const data = imageData.data
      const width = imageData.width
      
      for (let y = roi.y; y < roi.y + roi.height; y += 2) {
        for (let x = roi.x; x < roi.x + roi.width; x += 2) {
          const index = (y * width + x) * 4
          const r = data[index]
          const g = data[index + 1] 
          const b = data[index + 2]
          
          // Detect yellow-ish pixels (high R+G, low B)
          if (r > 150 && g > 150 && b < 100 && (r + g) > 2.5 * b) {
            // Mock pitch data calculation
            const height = 6 - ((y - roi.y) / roi.height) * 4 // 2-6 feet range
            const velocity = 45 + Math.random() * 20 // 45-65 mph
            
            return {
              timestamp: new Date().toISOString(),
              height,
              velocity,
              x,
              y
            }
          }
        }
      }
      return null
    }, [])

    const processFrame = useCallback(() => {
      if (!isTracking || !canvasRef.current) return
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Create mock image data for demonstration
      const imageData = ctx.createImageData(VIDEO_WIDTH, VIDEO_HEIGHT)
      
      // Simulate some yellow pixels in ROI area for testing
      if (Math.random() > 0.95) { // Occasional detection
        const mockX = roi.x + Math.random() * roi.width
        const mockY = roi.y + Math.random() * roi.height
        const index = (Math.floor(mockY) * VIDEO_WIDTH + Math.floor(mockX)) * 4
        
        if (index < imageData.data.length - 4) {
          imageData.data[index] = 255     // R
          imageData.data[index + 1] = 255 // G
          imageData.data[index + 2] = 50  // B
          imageData.data[index + 3] = 255 // A
          
          const pitchData = detectYellowBall(imageData, roi)
          if (pitchData) {
            onPitchDetected(pitchData)
          }
        }
      }
    }, [isTracking, roi, detectYellowBall, onPitchDetected])

    useEffect(() => {
      if (!isTracking) return
      
      const interval = setInterval(processFrame, 100) // Process at 10fps
      return () => clearInterval(interval)
    }, [isTracking, processFrame])

    return (
      <div ref={containerRef} style={{ position: 'relative', width: VIDEO_WIDTH, height: VIDEO_HEIGHT, background: '#333' }}>
        {/* Mock video element */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px'
          }}
        >
          Live Video Feed
        </div>
        
        <canvas 
          ref={canvasRef} 
          width={VIDEO_WIDTH} 
          height={VIDEO_HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0 }}
        />
        
        <DraggableROI
          roi={roi}
          onROIChange={onROIChange}
          containerWidth={VIDEO_WIDTH}
          containerHeight={VIDEO_HEIGHT}
        />
        
        <CalibrationMeter />
        
        {isTracking && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', color: '#0f0' }}>
            <span className="status-indicator status-active"></span>
            TRACKING ACTIVE
          </div>
        )}
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer