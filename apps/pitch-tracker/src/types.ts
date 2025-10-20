export interface ROIPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface PitchData {
  timestamp: string
  height: number
  velocity: number
  x: number
  y: number
}

export interface CalibrationPoint {
  pixel: { x: number; y: number }
  realWorld: { height: number } // height in feet
}