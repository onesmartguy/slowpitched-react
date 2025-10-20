import { useCallback } from 'react'
import Draggable from 'react-draggable'
import { ROIPosition } from '../types'

interface DraggableROIProps {
  roi: ROIPosition
  onROIChange: (roi: ROIPosition) => void
  containerWidth: number
  containerHeight: number
}

const DraggableROI: React.FC<DraggableROIProps> = ({
  roi,
  onROIChange,
  containerWidth,
  containerHeight
}) => {
  const handleDrag = useCallback((_e: any, data: { x: number; y: number }) => {
    const newRoi = {
      ...roi,
      x: Math.max(0, Math.min(data.x, containerWidth - roi.width)),
      y: Math.max(0, Math.min(data.y, containerHeight - roi.height))
    }
    onROIChange(newRoi)
  }, [roi, onROIChange, containerWidth, containerHeight])

  const handleResize = useCallback((corner: string, deltaX: number, deltaY: number) => {
    let newRoi = { ...roi }
    
    switch (corner) {
      case 'se': // Southeast corner
        newRoi.width = Math.max(50, Math.min(roi.width + deltaX, containerWidth - roi.x))
        newRoi.height = Math.max(50, Math.min(roi.height + deltaY, containerHeight - roi.y))
        break
      case 'sw': // Southwest corner
        const newWidth = Math.max(50, roi.width - deltaX)
        const newX = Math.max(0, roi.x + (roi.width - newWidth))
        newRoi.x = newX
        newRoi.width = newWidth
        newRoi.height = Math.max(50, Math.min(roi.height + deltaY, containerHeight - roi.y))
        break
      case 'ne': // Northeast corner
        newRoi.width = Math.max(50, Math.min(roi.width + deltaX, containerWidth - roi.x))
        const newHeight = Math.max(50, roi.height - deltaY)
        const newY = Math.max(0, roi.y + (roi.height - newHeight))
        newRoi.y = newY
        newRoi.height = newHeight
        break
      case 'nw': // Northwest corner
        const newWidthNW = Math.max(50, roi.width - deltaX)
        const newHeightNW = Math.max(50, roi.height - deltaY)
        newRoi.x = Math.max(0, roi.x + (roi.width - newWidthNW))
        newRoi.y = Math.max(0, roi.y + (roi.height - newHeightNW))
        newRoi.width = newWidthNW
        newRoi.height = newHeightNW
        break
    }
    
    onROIChange(newRoi)
  }, [roi, onROIChange, containerWidth, containerHeight])

  return (
    <Draggable
      position={{ x: roi.x, y: roi.y }}
      onDrag={handleDrag}
      bounds={{ left: 0, top: 0, right: containerWidth - roi.width, bottom: containerHeight - roi.height }}
    >
      <div 
        className="roi-overlay"
        style={{
          width: roi.width,
          height: roi.height,
          border: '2px solid #00ff00',
          background: 'rgba(0, 255, 0, 0.1)',
          position: 'absolute'
        }}
      >
        {/* Corner resize handles */}
        <div
          className="roi-handle"
          style={{ bottom: -5, right: -5, cursor: 'se-resize' }}
          onMouseDown={(e) => {
            e.stopPropagation()
            const startX = e.clientX
            const startY = e.clientY
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX
              const deltaY = moveEvent.clientY - startY
              handleResize('se', deltaX, deltaY)
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
        
        <div
          className="roi-handle"
          style={{ bottom: -5, left: -5, cursor: 'sw-resize' }}
          onMouseDown={(e) => {
            e.stopPropagation()
            const startX = e.clientX
            const startY = e.clientY
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX
              const deltaY = moveEvent.clientY - startY
              handleResize('sw', deltaX, deltaY)
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
        
        {/* ROI Info Label */}
        <div style={{
          position: 'absolute',
          top: -25,
          left: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#0f0',
          padding: '2px 6px',
          fontSize: '12px',
          borderRadius: '3px'
        }}>
          ROI: {roi.width}×{roi.height}
        </div>
      </div>
    </Draggable>
  )
}

export default DraggableROI