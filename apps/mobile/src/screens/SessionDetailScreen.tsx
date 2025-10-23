import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getSessionById } from '../services/database/sessionService';
import { getPitchesBySession } from '../services/database/pitchService';
import { getSessionSummary } from '../services/database/statisticsService';
import { exportSessionToCSV } from '../utils/csvExport';
import type { Session, Pitch, SessionSummary } from '../types';

type RouteParams = {
  SessionDetail: {
    sessionId: string;
  };
};

/**
 * Session Detail Screen - Statistics and pitch list
 * Phase 4: Complete implementation with CSV export
 */
export default function SessionDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'SessionDetail'>>();
  const navigation = useNavigation();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  const loadSessionData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [sessionData, pitchData, summaryData] = await Promise.all([
        getSessionById(sessionId),
        getPitchesBySession(sessionId),
        getSessionSummary(sessionId),
      ]);

      setSession(sessionData);
      setPitches(pitchData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  // Handle CSV export
  const handleExport = useCallback(async () => {
    if (!session || !summary) return;

    try {
      const csv = await exportSessionToCSV(sessionId);

      // Use native share sheet
      await Share.share({
        message: csv,
        title: `${session.name} - Pitch Data`,
      });
    } catch (err) {
      console.error('Failed to export:', err);
      Alert.alert('Error', 'Failed to export session data');
    }
  }, [session, summary, sessionId]);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  // Render error state
  if (error || !session || !summary) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Session not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = summary.statistics;
  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{session.name}</Text>
        {session.pitcherName && <Text style={styles.subtitle}>{session.pitcherName}</Text>}
        <Text style={styles.date}>{formattedDate}</Text>
        {session.location && <Text style={styles.location}>📍 {session.location}</Text>}
      </View>

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>📤 Export to CSV</Text>
      </TouchableOpacity>

      {/* Statistics Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>

        <View style={styles.statsGrid}>
          <StatCard label="Total Pitches" value={stats.totalPitches.toString()} icon="⚾" />
          <StatCard
            label="Avg Height"
            value={`${stats.avgHeight.toFixed(2)} ft`}
            icon="📏"
            subtitle={`±${summary.avgUncertainty.toFixed(2)} ft`}
          />
          <StatCard label="Min Height" value={`${stats.minHeight.toFixed(2)} ft`} icon="⬇️" />
          <StatCard label="Max Height" value={`${stats.maxHeight.toFixed(2)} ft`} icon="⬆️" />
          <StatCard label="Median" value={`${stats.medianHeight.toFixed(2)} ft`} icon="📊" />
          <StatCard label="Std Dev" value={`${stats.stdDev.toFixed(2)} ft`} icon="📈" />
        </View>
      </View>

      {/* Percentiles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Percentiles</Text>
        <View style={styles.percentileContainer}>
          <PercentileBar
            label="25th"
            value={stats.percentile25}
            min={stats.minHeight}
            max={stats.maxHeight}
          />
          <PercentileBar
            label="50th"
            value={stats.medianHeight}
            min={stats.minHeight}
            max={stats.maxHeight}
          />
          <PercentileBar
            label="75th"
            value={stats.percentile75}
            min={stats.minHeight}
            max={stats.maxHeight}
          />
        </View>
      </View>

      {/* Quality Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality Distribution</Text>
        <View style={styles.qualityContainer}>
          <QualityBar
            label="Excellent"
            count={summary.qualityDistribution.excellent}
            total={stats.totalPitches}
            color="#34C759"
          />
          <QualityBar
            label="Good"
            count={summary.qualityDistribution.good}
            total={stats.totalPitches}
            color="#007AFF"
          />
          <QualityBar
            label="Fair"
            count={summary.qualityDistribution.fair}
            total={stats.totalPitches}
            color="#FF9500"
          />
          <QualityBar
            label="Poor"
            count={summary.qualityDistribution.poor}
            total={stats.totalPitches}
            color="#FF3B30"
          />
        </View>
      </View>

      {/* Pitch Frequency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>Pitch Frequency</Text>
          <Text style={styles.performanceValue}>
            {summary.pitchFrequency.toFixed(1)} pitches/min
          </Text>
        </View>
      </View>

      {/* Pitch List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pitch History ({pitches.length})</Text>
        {pitches.length > 0 ? (
          <View style={styles.pitchList}>
            {pitches.slice(0, 20).map((pitch, index) => (
              <PitchRow key={pitch.id} pitch={pitch} index={pitches.length - index} />
            ))}
            {pitches.length > 20 && (
              <Text style={styles.moreText}>
                +{pitches.length - 20} more pitches (export to see all)
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>No pitches recorded</Text>
        )}
      </View>

      {/* Notes */}
      {session.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

/**
 * Statistics Card Component
 */
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  subtitle?: string;
}

function StatCard({ label, value, icon, subtitle }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

/**
 * Percentile Bar Component
 */
interface PercentileBarProps {
  label: string;
  value: number;
  min: number;
  max: number;
}

function PercentileBar({ label, value, min, max }: PercentileBarProps) {
  const range = max - min;
  const percentage = range > 0 ? ((value - min) / range) * 100 : 50;

  return (
    <View style={styles.percentileRow}>
      <Text style={styles.percentileLabel}>{label}</Text>
      <View style={styles.percentileBarContainer}>
        <View style={styles.percentileBarBg}>
          <View style={[styles.percentileBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.percentileValue}>{value.toFixed(2)} ft</Text>
      </View>
    </View>
  );
}

/**
 * Quality Bar Component
 */
interface QualityBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function QualityBar({ label, count, total, color }: QualityBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.qualityRow}>
      <Text style={styles.qualityLabel}>{label}</Text>
      <View style={styles.qualityBarContainer}>
        <View style={styles.qualityBarBg}>
          <View style={[styles.qualityBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.qualityCount}>
          {count} ({percentage.toFixed(0)}%)
        </Text>
      </View>
    </View>
  );
}

/**
 * Pitch Row Component
 */
interface PitchRowProps {
  pitch: Pitch;
  index: number;
}

function PitchRow({ pitch, index }: PitchRowProps) {
  const time = new Date(pitch.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const qualityColor =
    pitch.qualityScore >= 90
      ? '#34C759'
      : pitch.qualityScore >= 70
        ? '#007AFF'
        : pitch.qualityScore >= 50
          ? '#FF9500'
          : '#FF3B30';

  return (
    <View style={styles.pitchRow}>
      <Text style={styles.pitchIndex}>#{index}</Text>
      <View style={styles.pitchDetails}>
        <Text style={styles.pitchHeight}>
          {pitch.height.toFixed(2)} ft
          <Text style={styles.pitchUncertainty}> ±{pitch.uncertainty.toFixed(2)}</Text>
        </Text>
        <Text style={styles.pitchTime}>{time}</Text>
      </View>
      <View style={[styles.qualityBadge, { backgroundColor: qualityColor }]}>
        <Text style={styles.qualityBadgeText}>{pitch.qualityScore.toFixed(0)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
  centerContainer: {
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  date: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  exportButton: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 12,
  },
  location: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  moreText: {
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    color: '#000',
    fontSize: 15,
    lineHeight: 22,
  },
  percentileBarBg: {
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  percentileBarContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  percentileBarFill: {
    backgroundColor: '#007AFF',
    height: '100%',
  },
  percentileContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  percentileLabel: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    width: 60,
  },
  percentileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  percentileValue: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  performanceCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  performanceLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8,
  },
  performanceValue: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
  },
  pitchDetails: {
    flex: 1,
    marginLeft: 12,
  },
  pitchHeight: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  pitchIndex: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    width: 40,
  },
  pitchList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
  },
  pitchRow: {
    alignItems: 'center',
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  pitchTime: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  pitchUncertainty: {
    color: '#8E8E93',
    fontSize: 14,
  },
  qualityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qualityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityBarBg: {
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    flex: 1,
    height: 24,
    overflow: 'hidden',
  },
  qualityBarContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  qualityBarFill: {
    height: '100%',
  },
  qualityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  qualityCount: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  qualityLabel: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  qualityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flex: 1,
    margin: 4,
    minWidth: '45%',
    padding: 16,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  statSubtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  statValue: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 4,
  },
  title: {
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
