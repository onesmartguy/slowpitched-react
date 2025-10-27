/**
 * Session Statistics Service
 * Calculate statistical metrics for pitch sessions
 */
import type { SessionStatistics } from '../../types';
/**
 * Calculate statistics for a session
 */
export declare function calculateSessionStatistics(sessionId: string): Promise<SessionStatistics>;
/**
 * Get pitch height distribution (histogram bins)
 */
export declare function getPitchHeightDistribution(sessionId: string, binCount?: number): Promise<{
    binStart: number;
    binEnd: number;
    count: number;
}[]>;
/**
 * Calculate average uncertainty for a session
 */
export declare function calculateAverageUncertainty(sessionId: string): Promise<number>;
/**
 * Get pitch quality distribution
 */
export declare function getPitchQualityDistribution(sessionId: string): Promise<{
    excellent: number;
    good: number;
    fair: number;
    poor: number;
}>;
/**
 * Get pitch frequency over time (pitches per minute)
 */
export declare function getPitchFrequency(sessionId: string): Promise<number>;
/**
 * Get session summary with all key metrics
 */
export declare function getSessionSummary(sessionId: string): Promise<{
    statistics: SessionStatistics;
    avgUncertainty: number;
    qualityDistribution: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
    };
    pitchFrequency: number;
}>;
//# sourceMappingURL=statisticsService.d.ts.map