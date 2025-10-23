import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  getAllSessions,
  getRecentSessions,
  deleteSession,
} from '../services/database/sessionService';
import type { Session } from '../types';

/**
 * Dashboard Screen - Session list and management
 * Phase 4: Complete implementation with session list, statistics, and navigation
 */
export default function DashboardScreen() {
  const navigation = useNavigation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      setError(null);
      const allSessions = await getAllSessions();
      setSessions(allSessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load on mount and when screen is focused
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSessions();
  }, [loadSessions]);

  // Handle delete session
  const handleDeleteSession = useCallback(
    (session: Session) => {
      Alert.alert(
        'Delete Session',
        `Are you sure you want to delete "${session.name}"? This will delete all ${session.pitchCount || 0} pitches.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSession(session.id);
                await loadSessions();
              } catch (err) {
                console.error('Failed to delete session:', err);
                Alert.alert('Error', 'Failed to delete session');
              }
            },
          },
        ]
      );
    },
    [loadSessions]
  );

  // Handle session press
  const handleSessionPress = useCallback(
    (session: Session) => {
      // Navigate to session detail screen
      // @ts-ignore - React Navigation types incompatible with React 19
      navigation.navigate('SessionDetail', { sessionId: session.id });
    },
    [navigation]
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSessions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state
  if (sessions.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Sessions Yet</Text>
        <Text style={styles.emptyText}>
          Start tracking pitches to see your sessions here.{'\n\n'}
          Go to the Tracking tab to begin.
        </Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sessions</Text>
        <Text style={styles.subtitle}>{sessions.length} total</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => handleSessionPress(session)}
            onDelete={() => handleDeleteSession(session)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Session Card Component
 */
interface SessionCardProps {
  session: Session;
  onPress: () => void;
  onDelete: () => void;
}

function SessionCard({ session, onPress, onDelete }: SessionCardProps) {
  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const pitchCount = session.pitchCount || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {session.name}
          </Text>
          {session.pitcherName && (
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {session.pitcherName}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardDetailRow}>
          <Text style={styles.cardDetailLabel}>Date:</Text>
          <Text style={styles.cardDetailValue}>{formattedDate}</Text>
        </View>

        {session.location && (
          <View style={styles.cardDetailRow}>
            <Text style={styles.cardDetailLabel}>Location:</Text>
            <Text style={styles.cardDetailValue}>{session.location}</Text>
          </View>
        )}

        <View style={styles.cardDetailRow}>
          <Text style={styles.cardDetailLabel}>Pitches:</Text>
          <Text style={styles.cardDetailValue}>{pitchCount}</Text>
        </View>
      </View>

      {session.notes && (
        <Text style={styles.cardNotes} numberOfLines={2}>
          {session.notes}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardDetails: {
    marginTop: 12,
  },
  cardDetailLabel: {
    color: '#8E8E93',
    fontSize: 14,
    width: 80,
  },
  cardDetailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },
  cardDetailValue: {
    color: '#000',
    flex: 1,
    fontSize: 14,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNotes: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
  },
  cardSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  cardTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
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
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 12,
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
  scrollContent: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  viewDetailsText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
