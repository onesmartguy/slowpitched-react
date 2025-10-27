/**
 * Performance Monitoring Utilities
 * Phase 7.2: Performance Optimization
 *
 * Provides utilities for measuring and tracking app performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, any>;
}

export interface PerformanceSample {
  metric: string;
  samples: number[];
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private enabled: boolean = __DEV__;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    if (!this.enabled) {
      return () => {};
    }

    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number): void {
    if (!this.enabled) {
      return;
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const samples = this.metrics.get(name)!;
    samples.push(value);

    // Keep only last 1000 samples to prevent memory issues
    if (samples.length > 1000) {
      samples.shift();
    }
  }

  /**
   * Get statistics for a metric
   */
  getMetricStats(name: string): PerformanceSample | null {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      metric: name,
      samples: sorted,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get all metric statistics
   */
  getAllMetricStats(): PerformanceSample[] {
    const stats: PerformanceSample[] = [];

    for (const name of this.metrics.keys()) {
      const stat = this.getMetricStats(name);
      if (stat) {
        stats.push(stat);
      }
    }

    return stats;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Clear specific metric
   */
  clearMetric(name: string): void {
    this.metrics.delete(name);
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const stats = this.getAllMetricStats();

    if (stats.length === 0) {
      return 'No performance metrics recorded';
    }

    let report = 'Performance Metrics Report\n';
    report += '=' .repeat(80) + '\n\n';

    for (const stat of stats) {
      report += `Metric: ${stat.metric}\n`;
      report += `  Samples: ${stat.samples.length}\n`;
      report += `  Average: ${stat.avg.toFixed(2)}ms\n`;
      report += `  Min: ${stat.min.toFixed(2)}ms\n`;
      report += `  Max: ${stat.max.toFixed(2)}ms\n`;
      report += `  P95: ${stat.p95.toFixed(2)}ms\n`;
      report += `  P99: ${stat.p99.toFixed(2)}ms\n`;
      report += '\n';
    }

    return report;
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    console.log(this.generateReport());
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      const endTimer = performanceMonitor.startTimer(name);
      try {
        const result = originalMethod.apply(this, args);

        // Handle async functions
        if (result instanceof Promise) {
          return result.finally(() => endTimer());
        }

        endTimer();
        return result;
      } catch (error) {
        endTimer();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Hook for measuring React component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  React.useEffect(() => {
    const renderTime = performance.now() - startTime;
    performanceMonitor.recordMetric(`render:${componentName}`, renderTime);
  });
}

// Helper functions for common performance measurements
export const perf = {
  /**
   * Measure frame processing time
   */
  measureFrame: (callback: () => void) => {
    const endTimer = performanceMonitor.startTimer('frame_processing');
    try {
      callback();
    } finally {
      endTimer();
    }
  },

  /**
   * Measure database query time
   */
  measureQuery: async <T>(name: string, query: () => Promise<T>): Promise<T> => {
    const endTimer = performanceMonitor.startTimer(`db:${name}`);
    try {
      return await query();
    } finally {
      endTimer();
    }
  },

  /**
   * Measure API request time
   */
  measureRequest: async <T>(name: string, request: () => Promise<T>): Promise<T> => {
    const endTimer = performanceMonitor.startTimer(`api:${name}`);
    try {
      return await request();
    } finally {
      endTimer();
    }
  },
};

// Import React for usePerformanceMonitor hook
import React from 'react';
