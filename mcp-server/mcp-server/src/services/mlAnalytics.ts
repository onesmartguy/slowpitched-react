/**
 * ML Analytics Service
 * Phase 6: Advanced analytics with machine learning
 *
 * Simple ML algorithms for trend prediction and anomaly detection
 */

interface DataPoint {
  date: string;
  value: number;
}

interface PredictionResult {
  date: string;
  predicted: number;
  confidence: number;
}

interface AnomalyResult {
  index: number;
  value: number;
  zscore: number;
  isAnomaly: boolean;
}

/**
 * Linear Regression for trend prediction
 */
export class LinearRegression {
  private slope: number = 0;
  private intercept: number = 0;
  private trained: boolean = false;

  /**
   * Train model with data points
   */
  train(data: DataPoint[]): void {
    if (data.length < 2) {
      throw new Error('Need at least 2 data points for training');
    }

    // Convert dates to numeric timestamps
    const X = data.map((d, i) => i); // Use index as X
    const y = data.map(d => d.value);

    // Calculate means
    const meanX = X.reduce((a, b) => a + b, 0) / X.length;
    const meany = y.reduce((a, b) => a + b, 0) / y.length;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < X.length; i++) {
      numerator += (X[i] - meanX) * (y[i] - meany);
      denominator += Math.pow(X[i] - meanX, 2);
    }

    this.slope = numerator / denominator;
    this.intercept = meany - this.slope * meanX;
    this.trained = true;
  }

  /**
   * Predict future values
   */
  predict(steps: number): PredictionResult[] {
    if (!this.trained) {
      throw new Error('Model must be trained before prediction');
    }

    const predictions: PredictionResult[] = [];

    for (let i = 1; i <= steps; i++) {
      const predicted = this.slope * i + this.intercept;
      const confidence = Math.max(0, Math.min(1, 1 - (i * 0.1))); // Decrease confidence over time

      predictions.push({
        date: `Day +${i}`,
        predicted: parseFloat(predicted.toFixed(2)),
        confidence: parseFloat(confidence.toFixed(2)),
      });
    }

    return predictions;
  }

  /**
   * Calculate R² score (coefficient of determination)
   */
  rSquared(data: DataPoint[]): number {
    if (!this.trained) {
      throw new Error('Model must be trained before calculating R²');
    }

    const y = data.map(d => d.value);
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;

    let ssRes = 0; // Sum of squares of residuals
    let ssTot = 0; // Total sum of squares

    for (let i = 0; i < data.length; i++) {
      const predicted = this.slope * i + this.intercept;
      ssRes += Math.pow(y[i] - predicted, 2);
      ssTot += Math.pow(y[i] - meanY, 2);
    }

    return 1 - (ssRes / ssTot);
  }
}

/**
 * Moving Average for trend smoothing
 */
export function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN); // Not enough data for full window
      continue;
    }

    const windowData = data.slice(i - window + 1, i + 1);
    const avg = windowData.reduce((a, b) => a + b, 0) / window;
    result.push(avg);
  }

  return result;
}

/**
 * Exponential Moving Average for trend prediction
 */
export function exponentialMovingAverage(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];

  const result: number[] = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }

  return result;
}

/**
 * Z-Score anomaly detection
 */
export function detectAnomalies(data: number[], threshold: number = 3): AnomalyResult[] {
  // Calculate mean and standard deviation
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  // Calculate z-scores and detect anomalies
  return data.map((value, index) => {
    const zscore = (value - mean) / stdDev;
    return {
      index,
      value,
      zscore: parseFloat(zscore.toFixed(2)),
      isAnomaly: Math.abs(zscore) > threshold,
    };
  });
}

/**
 * Performance trend classification
 */
export function classifyTrend(data: DataPoint[]): {
  trend: 'improving' | 'stable' | 'declining';
  strength: number;
  confidence: number;
} {
  if (data.length < 3) {
    return { trend: 'stable', strength: 0, confidence: 0 };
  }

  // Calculate linear regression
  const model = new LinearRegression();
  model.train(data);

  // Get slope to determine trend
  const recentAvg = data.slice(-3).reduce((sum, d) => sum + d.value, 0) / 3;
  const overallAvg = data.reduce((sum, d) => sum + d.value, 0) / data.length;

  const diff = recentAvg - overallAvg;
  const strength = Math.abs(diff);

  let trend: 'improving' | 'stable' | 'declining';

  if (diff > 0.1) {
    trend = 'improving';
  } else if (diff < -0.1) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  const confidence = model.rSquared(data);

  return {
    trend,
    strength: parseFloat(strength.toFixed(2)),
    confidence: parseFloat(Math.max(0, confidence).toFixed(2)),
  };
}

/**
 * Calculate percentile from dataset
 */
export function calculatePercentile(data: number[], percentile: number): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Consistency score calculation
 */
export function calculateConsistency(data: number[]): {
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  cv: number;
} {
  if (data.length === 0) {
    return { score: 0, rating: 'poor', cv: 0 };
  }

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation (CV)
  const cv = (stdDev / mean) * 100;

  // Score based on CV (lower is better)
  let score: number;
  let rating: 'excellent' | 'good' | 'fair' | 'poor';

  if (cv < 5) {
    score = 100;
    rating = 'excellent';
  } else if (cv < 10) {
    score = 85;
    rating = 'good';
  } else if (cv < 15) {
    score = 70;
    rating = 'fair';
  } else {
    score = 50;
    rating = 'poor';
  }

  return {
    score,
    rating,
    cv: parseFloat(cv.toFixed(2)),
  };
}

/**
 * Performance forecast using exponential smoothing
 */
export function forecastPerformance(
  data: DataPoint[],
  horizon: number = 7
): PredictionResult[] {
  if (data.length < 3) {
    throw new Error('Need at least 3 data points for forecasting');
  }

  const values = data.map(d => d.value);
  const ema = exponentialMovingAverage(values, 0.3);
  const lastEma = ema[ema.length - 1];

  const predictions: PredictionResult[] = [];

  for (let i = 1; i <= horizon; i++) {
    const confidence = Math.max(0, Math.min(1, 1 - (i * 0.08)));

    predictions.push({
      date: `Day +${i}`,
      predicted: parseFloat(lastEma.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
    });
  }

  return predictions;
}
