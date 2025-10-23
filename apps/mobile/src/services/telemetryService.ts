/**
 * Telemetry Service
 * Phase 5: Track app usage and performance metrics
 *
 * Collects anonymized usage data for analytics and improvement
 */

interface TelemetryEvent {
  eventName: string;
  timestamp: number;
  properties?: Record<string, any>;
  sessionId?: string;
}

interface PerformanceMetric {
  metricName: string;
  value: number;
  unit: string;
  timestamp: number;
}

class TelemetryService {
  private events: TelemetryEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private sessionId: string;
  private enabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.enabled) return;

    const event: TelemetryEvent = {
      eventName,
      timestamp: Date.now(),
      properties,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    console.log(`[Telemetry] Event: ${eventName}`, properties);

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  /**
   * Track a performance metric
   */
  trackMetric(metricName: string, value: number, unit: string = 'ms'): void {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      metricName,
      value,
      unit,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    console.log(`[Telemetry] Metric: ${metricName} = ${value}${unit}`);

    // Keep only last 50 metrics in memory
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string): void {
    this.trackEvent('screen_view', { screen: screenName });
  }

  /**
   * Track user action
   */
  trackAction(actionName: string, details?: Record<string, any>): void {
    this.trackEvent('user_action', { action: actionName, ...details });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Get all tracked events
   */
  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  /**
   * Get all tracked metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all telemetry data
   */
  clear(): void {
    this.events = [];
    this.metrics = [];
    this.sessionId = this.generateSessionId();
  }

  /**
   * Enable/disable telemetry
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[Telemetry] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Export telemetry data as JSON
   */
  exportData(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      events: this.events,
      metrics: this.metrics,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalEvents: number;
    totalMetrics: number;
    sessionDuration: number;
    topEvents: Array<{ event: string; count: number }>;
    avgMetrics: Record<string, number>;
  } {
    // Count events by type
    const eventCounts: Record<string, number> = {};
    this.events.forEach((event) => {
      eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
    });

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average metrics
    const metricSums: Record<string, { sum: number; count: number }> = {};
    this.metrics.forEach((metric) => {
      if (!metricSums[metric.metricName]) {
        metricSums[metric.metricName] = { sum: 0, count: 0 };
      }
      metricSums[metric.metricName].sum += metric.value;
      metricSums[metric.metricName].count += 1;
    });

    const avgMetrics: Record<string, number> = {};
    Object.entries(metricSums).forEach(([name, { sum, count }]) => {
      avgMetrics[name] = sum / count;
    });

    // Calculate session duration
    const firstEvent = this.events[0];
    const lastEvent = this.events[this.events.length - 1];
    const sessionDuration = firstEvent && lastEvent
      ? lastEvent.timestamp - firstEvent.timestamp
      : 0;

    return {
      totalEvents: this.events.length,
      totalMetrics: this.metrics.length,
      sessionDuration,
      topEvents,
      avgMetrics,
    };
  }
}

// Singleton instance
const telemetryService = new TelemetryService();

export default telemetryService;

// Convenience exports
export const {
  trackEvent,
  trackMetric,
  trackScreen,
  trackAction,
  trackError,
  getEvents,
  getMetrics,
  getSummary,
  exportData,
} = {
  trackEvent: telemetryService.trackEvent.bind(telemetryService),
  trackMetric: telemetryService.trackMetric.bind(telemetryService),
  trackScreen: telemetryService.trackScreen.bind(telemetryService),
  trackAction: telemetryService.trackAction.bind(telemetryService),
  trackError: telemetryService.trackError.bind(telemetryService),
  getEvents: telemetryService.getEvents.bind(telemetryService),
  getMetrics: telemetryService.getMetrics.bind(telemetryService),
  getSummary: telemetryService.getSummary.bind(telemetryService),
  exportData: telemetryService.exportData.bind(telemetryService),
};
