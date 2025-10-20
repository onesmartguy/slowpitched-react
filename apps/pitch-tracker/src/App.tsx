import React, { useState, useCallback } from 'react';
import { StyleSheet, SafeAreaView, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import VideoPlayer from './components/VideoPlayer';
import ControlsPanel from './components/ControlsPanel';
import Logger from './components/Logger';
import { PitchData, ROIPosition } from './types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [roi, setRoi] = useState<ROIPosition>({ 
    x: isTablet ? 150 : 50, 
    y: isTablet ? 150 : 100, 
    width: isTablet ? 300 : 200, 
    height: isTablet ? 225 : 150 
  });
  const [pitchData, setPitchData] = useState<PitchData[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const handleStartTracking = () => {
    setIsTracking(true);
    addLog('Tracking started');
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    addLog('Tracking stopped');
  };

  const handleExportData = async () => {
    if (pitchData.length === 0) {
      addLog('No data to export');
      return;
    }

    const csv = [
      'timestamp,height,velocity,x_position,y_position',
      ...pitchData.map(data => 
        `${data.timestamp},${data.height},${data.velocity},${data.x},${data.y}`
      )
    ].join('\n');

    try {
      // React Native file export will be handled by expo-sharing
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      
      const fileName = `pitch_data_${Date.now()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csv);
      await Sharing.shareAsync(fileUri);
      
      addLog(`Exported ${pitchData.length} data points`);
    } catch (error) {
      addLog('Export failed: ' + error);
    }
  };

  const handlePitchDetected = (data: PitchData) => {
    setPitchData(prev => [...prev, data]);
    addLog(`Pitch detected: Height ${data.height.toFixed(1)}ft, Velocity ${data.velocity.toFixed(1)}mph`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Responsive layout for iPhone vs iPad */}
      {isTablet ? (
        // iPad layout - side by side
        <SafeAreaView style={styles.tabletContainer}>
          <VideoPlayer
            style={styles.tabletVideoContainer}
            roi={roi}
            onROIChange={setRoi}
            isTracking={isTracking}
            onPitchDetected={handlePitchDetected}
          />
          
          <SafeAreaView style={styles.tabletControlsContainer}>
            <ControlsPanel
              isTracking={isTracking}
              onStartTracking={handleStartTracking}
              onStopTracking={handleStopTracking}
              onExportData={handleExportData}
              pitchCount={pitchData.length}
            />
            
            <Logger logs={logs} style={styles.tabletLogger} />
          </SafeAreaView>
        </SafeAreaView>
      ) : (
        // iPhone layout - stacked
        <SafeAreaView style={styles.phoneContainer}>
          <VideoPlayer
            style={styles.phoneVideoContainer}
            roi={roi}
            onROIChange={setRoi}
            isTracking={isTracking}
            onPitchDetected={handlePitchDetected}
          />
          
          <ControlsPanel
            style={styles.phoneControlsPanel}
            isTracking={isTracking}
            onStartTracking={handleStartTracking}
            onStopTracking={handleStopTracking}
            onExportData={handleExportData}
            pitchCount={pitchData.length}
          />
          
          <Logger logs={logs} style={styles.phoneLogger} />
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  
  // Tablet styles
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  tabletVideoContainer: {
    flex: 2,
    marginRight: 20,
  },
  tabletControlsContainer: {
    flex: 1,
    minWidth: 300,
  },
  tabletLogger: {
    flex: 1,
    marginTop: 20,
  },
  
  // Phone styles  
  phoneContainer: {
    flex: 1,
    padding: 10,
  },
  phoneVideoContainer: {
    height: screenWidth * 0.75, // 4:3 aspect ratio
    marginBottom: 15,
  },
  phoneControlsPanel: {
    marginBottom: 15,
  },
  phoneLogger: {
    flex: 1,
    minHeight: 150,
  },
});