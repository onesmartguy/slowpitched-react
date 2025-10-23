import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { initDatabase } from './src/services/database';
import telemetryService from './src/services/telemetryService';

// Screens
import TrackingScreen from './src/screens/TrackingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SessionDetailScreen from './src/screens/SessionDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Dashboard Stack Navigator
 * Includes session list and session detail screens
 */
function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardList"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  // Initialize database and telemetry on app startup
  useEffect(() => {
    const startTime = Date.now();

    telemetryService.trackEvent('app_start');

    initDatabase()
      .then(() => {
        const initTime = Date.now() - startTime;
        console.log('[App] Database initialized');
        telemetryService.trackMetric('database_init_time', initTime, 'ms');
        telemetryService.trackEvent('database_initialized');
      })
      .catch((error) => {
        console.error('[App] Database initialization failed:', error);
        telemetryService.trackError(error as Error, { context: 'database_init' });
      });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
          }}
        >
          <Tab.Screen
            name="Tracking"
            component={TrackingScreen}
            options={{
              title: 'Track Pitches',
              tabBarLabel: 'Track',
            }}
          />
          <Tab.Screen
            name="Dashboard"
            component={DashboardStack}
            options={{
              title: 'Dashboard',
              tabBarLabel: 'Sessions',
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              tabBarLabel: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
