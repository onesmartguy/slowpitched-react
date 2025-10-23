/**
 * CSV Export Utilities
 * Phase 4: Export session data to CSV format
 */

import { getSessionById } from '../services/database/sessionService';
import { getPitchesBySession } from '../services/database/pitchService';
import { getSessionSummary } from '../services/database/statisticsService';

/**
 * Export session to CSV format
 * @param sessionId - Session ID to export
 * @returns CSV string
 */
export async function exportSessionToCSV(sessionId: string): Promise<string> {
  const session = await getSessionById(sessionId);
  const pitches = await getPitchesBySession(sessionId);
  const summary = await getSessionSummary(sessionId);

  let csv = '';

  // Session metadata
  csv += `Session: ${escapeCSV(session.name)}\n`;
  csv += `Date: ${session.date}\n`;
  if (session.pitcherName) {
    csv += `Pitcher: ${escapeCSV(session.pitcherName)}\n`;
  }
  if (session.location) {
    csv += `Location: ${escapeCSV(session.location)}\n`;
  }
  csv += `Total Pitches: ${summary.statistics.totalPitches}\n`;
  csv += `\n`;

  // Statistics summary
  csv += `Statistics\n`;
  csv += `Average Height,${summary.statistics.avgHeight.toFixed(2)},ft\n`;
  csv += `Average Uncertainty,${summary.avgUncertainty.toFixed(2)},ft\n`;
  csv += `Min Height,${summary.statistics.minHeight.toFixed(2)},ft\n`;
  csv += `Max Height,${summary.statistics.maxHeight.toFixed(2)},ft\n`;
  csv += `Median Height,${summary.statistics.medianHeight.toFixed(2)},ft\n`;
  csv += `25th Percentile,${summary.statistics.percentile25.toFixed(2)},ft\n`;
  csv += `75th Percentile,${summary.statistics.percentile75.toFixed(2)},ft\n`;
  csv += `Standard Deviation,${summary.statistics.stdDev.toFixed(2)},ft\n`;
  csv += `Variance,${summary.statistics.variance.toFixed(2)},ft²\n`;
  csv += `Pitch Frequency,${summary.pitchFrequency.toFixed(1)},pitches/min\n`;
  csv += `\n`;

  // Quality distribution
  csv += `Quality Distribution\n`;
  csv += `Excellent (90-100),${summary.qualityDistribution.excellent}\n`;
  csv += `Good (70-89),${summary.qualityDistribution.good}\n`;
  csv += `Fair (50-69),${summary.qualityDistribution.fair}\n`;
  csv += `Poor (0-49),${summary.qualityDistribution.poor}\n`;
  csv += `\n`;

  // Pitch data header
  csv += `Pitch Data\n`;
  csv += `Pitch #,Timestamp,Height (ft),Uncertainty (±ft),Quality Score,Ball X,Ball Y`;
  if (pitches.some((p) => p.calibrationId)) {
    csv += `,Calibration ID`;
  }
  if (pitches.some((p) => p.metadata)) {
    csv += `,Notes`;
  }
  csv += `\n`;

  // Pitch data rows
  pitches.forEach((pitch, index) => {
    const timestamp = new Date(pitch.timestamp).toISOString();
    const pitchNum = index + 1;

    csv += `${pitchNum},`;
    csv += `${timestamp},`;
    csv += `${pitch.height.toFixed(2)},`;
    csv += `${pitch.uncertainty.toFixed(2)},`;
    csv += `${pitch.qualityScore.toFixed(0)},`;
    csv += `${pitch.ballPosition.x},`;
    csv += `${pitch.ballPosition.y}`;

    if (pitches.some((p) => p.calibrationId)) {
      csv += `,${pitch.calibrationId || ''}`;
    }

    if (pitches.some((p) => p.metadata)) {
      const notes = pitch.metadata?.notes || '';
      csv += `,${escapeCSV(notes)}`;
    }

    csv += `\n`;
  });

  // Notes section
  if (session.notes) {
    csv += `\n`;
    csv += `Session Notes\n`;
    csv += `${escapeCSV(session.notes)}\n`;
  }

  return csv;
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Export multiple sessions to CSV
 * @param sessionIds - Array of session IDs to export
 * @returns CSV string with all sessions
 */
export async function exportMultipleSessionsToCSV(sessionIds: string[]): Promise<string> {
  const csvs = await Promise.all(sessionIds.map((id) => exportSessionToCSV(id)));
  return csvs.join('\n\n' + '='.repeat(80) + '\n\n');
}
