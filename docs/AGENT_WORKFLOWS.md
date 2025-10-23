# Agent Workflow Examples

**Phase 5: Agentic AI Integration**

This document provides complete, production-ready examples of agent workflows that integrate with the Pitch Height Tracker Pro MCP API.

---

## Table of Contents

1. [Python Agent: Automated Pitch Analysis](#python-agent-automated-pitch-analysis)
2. [Node.js Agent: Session Monitoring](#nodejs-agent-session-monitoring)
3. [CLI Tool: Batch Data Export](#cli-tool-batch-data-export)
4. [Webhook Integration: Real-time Notifications](#webhook-integration-real-time-notifications)
5. [ML Pipeline: Trend Prediction](#ml-pipeline-trend-prediction)
6. [Scheduled Reports: Email Summary](#scheduled-reports-email-summary)

---

## Python Agent: Automated Pitch Analysis

**Use Case**: Automatically analyze completed sessions and generate coaching insights.

### Complete Implementation

```python
#!/usr/bin/env python3
"""
Pitch Analysis Agent
Automatically analyzes pitch sessions and generates coaching insights
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import statistics

BASE_URL = "http://localhost:3000/api"

class PitchAnalysisAgent:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url

    def get_recent_sessions(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get sessions from the last N days"""
        date_from = (datetime.now() - timedelta(days=days)).isoformat()

        response = requests.get(
            f"{self.base_url}/data/sessions",
            params={"dateFrom": date_from, "limit": 100}
        )
        response.raise_for_status()
        return response.json()["sessions"]

    def get_session_analysis(self, session_id: str) -> Dict[str, Any]:
        """Get detailed analysis for a session"""
        response = requests.get(
            f"{self.base_url}/analytics/sessions/{session_id}/summary"
        )
        response.raise_for_status()
        return response.json()

    def get_pitch_distribution(self, session_id: str) -> Dict[str, Any]:
        """Get pitch height distribution"""
        response = requests.get(
            f"{self.base_url}/analytics/sessions/{session_id}/distribution",
            params={"bins": 10}
        )
        response.raise_for_status()
        return response.json()

    def analyze_consistency(self, summary: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze pitcher consistency"""
        stats = summary["statistics"]
        avg_height = stats["avgHeight"]
        std_dev = stats["stdDev"]

        # Calculate coefficient of variation (CV)
        cv = (std_dev / avg_height) * 100 if avg_height > 0 else 0

        # Determine consistency rating
        if cv < 5:
            rating = "Excellent"
            message = "Very consistent pitch heights with minimal variation"
        elif cv < 10:
            rating = "Good"
            message = "Good consistency with acceptable variation"
        elif cv < 15:
            rating = "Fair"
            message = "Moderate variation - focus on release point consistency"
        else:
            rating = "Needs Improvement"
            message = "High variation - work on mechanics and release point"

        return {
            "rating": rating,
            "cv_percentage": round(cv, 2),
            "message": message
        }

    def analyze_quality_trends(self, summary: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze pitch quality trends"""
        quality = summary["qualityDistribution"]
        total = sum(quality.values())

        if total == 0:
            return {"rating": "No Data", "message": "No pitches recorded"}

        excellent_pct = (quality["excellent"] / total) * 100
        good_pct = (quality["good"] / total) * 100

        if excellent_pct >= 70:
            rating = "Excellent"
            message = "Majority of pitches are high quality"
        elif excellent_pct + good_pct >= 80:
            rating = "Good"
            message = "Most pitches are good to excellent quality"
        elif excellent_pct + good_pct >= 60:
            rating = "Fair"
            message = "Mix of quality - focus on technique refinement"
        else:
            rating = "Needs Improvement"
            message = "Many low-quality pitches - review fundamentals"

        return {
            "rating": rating,
            "excellent_pct": round(excellent_pct, 1),
            "good_pct": round(good_pct, 1),
            "message": message
        }

    def generate_coaching_insights(self, session_id: str) -> Dict[str, Any]:
        """Generate comprehensive coaching insights"""
        summary = self.get_session_analysis(session_id)
        distribution = self.get_pitch_distribution(session_id)

        stats = summary["statistics"]
        consistency = self.analyze_consistency(summary)
        quality = self.analyze_quality_trends(summary)

        # Identify height trends
        avg_height = stats["avgHeight"]
        if avg_height < 4.0:
            height_feedback = "Pitches are consistently low - adjust release point upward"
        elif avg_height > 6.0:
            height_feedback = "Pitches are consistently high - lower release point"
        elif 4.8 <= avg_height <= 5.2:
            height_feedback = "Excellent height control around the strike zone sweet spot"
        else:
            height_feedback = f"Average height of {avg_height:.2f}ft is acceptable"

        # Generate recommendations
        recommendations = []

        if consistency["rating"] in ["Fair", "Needs Improvement"]:
            recommendations.append(
                "Focus on consistent release point and mechanics"
            )

        if quality["rating"] in ["Fair", "Needs Improvement"]:
            recommendations.append(
                "Work on tracking and calibration quality"
            )

        if stats["avgHeight"] < 4.0 or stats["avgHeight"] > 6.0:
            recommendations.append(
                "Adjust release point to target 5ft strike zone height"
            )

        if not recommendations:
            recommendations.append("Maintain current technique - performance is strong")

        return {
            "session_id": session_id,
            "analysis_date": datetime.now().isoformat(),
            "statistics": {
                "avg_height": round(stats["avgHeight"], 2),
                "std_dev": round(stats["stdDev"], 2),
                "min_height": round(stats["minHeight"], 2),
                "max_height": round(stats["maxHeight"], 2),
                "total_pitches": stats["count"]
            },
            "consistency": consistency,
            "quality": quality,
            "height_feedback": height_feedback,
            "recommendations": recommendations,
            "distribution": distribution["distribution"]
        }

    def run_analysis_pipeline(self, days: int = 7) -> List[Dict[str, Any]]:
        """Run analysis pipeline for recent sessions"""
        print(f"🤖 Pitch Analysis Agent Starting...")
        print(f"📅 Analyzing sessions from last {days} days\n")

        sessions = self.get_recent_sessions(days)
        print(f"✅ Found {len(sessions)} sessions\n")

        insights = []
        for session in sessions:
            session_id = session["id"]
            session_name = session["name"]

            print(f"🔍 Analyzing: {session_name} (ID: {session_id})")

            try:
                insight = self.generate_coaching_insights(session_id)
                insights.append(insight)

                # Print summary
                print(f"   Pitches: {insight['statistics']['total_pitches']}")
                print(f"   Avg Height: {insight['statistics']['avg_height']}ft")
                print(f"   Consistency: {insight['consistency']['rating']}")
                print(f"   Quality: {insight['quality']['rating']}")
                print(f"   📝 {len(insight['recommendations'])} recommendations")
                print()

            except Exception as e:
                print(f"   ❌ Error: {str(e)}\n")

        print(f"✅ Analysis complete: {len(insights)} sessions analyzed")
        return insights

    def export_insights_to_json(self, insights: List[Dict[str, Any]], filename: str):
        """Export insights to JSON file"""
        with open(filename, 'w') as f:
            json.dump({
                "generated_at": datetime.now().isoformat(),
                "total_sessions": len(insights),
                "insights": insights
            }, f, indent=2)
        print(f"💾 Insights saved to {filename}")


def main():
    """Main entry point"""
    agent = PitchAnalysisAgent()

    # Run analysis pipeline
    insights = agent.run_analysis_pipeline(days=7)

    # Export results
    if insights:
        agent.export_insights_to_json(
            insights,
            f"pitch_analysis_{datetime.now().strftime('%Y%m%d')}.json"
        )

        # Print summary report
        print("\n" + "="*60)
        print("SUMMARY REPORT")
        print("="*60)

        avg_consistency = statistics.mean([
            i["consistency"]["cv_percentage"] for i in insights
        ])

        print(f"Total Sessions Analyzed: {len(insights)}")
        print(f"Average Consistency (CV): {avg_consistency:.2f}%")
        print(f"Report saved: pitch_analysis_{datetime.now().strftime('%Y%m%d')}.json")


if __name__ == "__main__":
    main()
```

### Usage

```bash
# Install dependencies
pip install requests

# Run agent
python pitch_analysis_agent.py

# Output:
# 🤖 Pitch Analysis Agent Starting...
# 📅 Analyzing sessions from last 7 days
#
# ✅ Found 3 sessions
#
# 🔍 Analyzing: Morning Practice (ID: session_123)
#    Pitches: 45
#    Avg Height: 5.12ft
#    Consistency: Good
#    Quality: Excellent
#    📝 1 recommendations
# ...
```

### Schedule with Cron

```bash
# Run daily at 8 AM
0 8 * * * /usr/bin/python3 /path/to/pitch_analysis_agent.py
```

---

## Node.js Agent: Session Monitoring

**Use Case**: Real-time monitoring of active sessions with alerts for performance issues.

### Complete Implementation

```javascript
#!/usr/bin/env node
/**
 * Session Monitoring Agent
 * Monitors active sessions and sends alerts for performance issues
 */

const axios = require('axios');
const EventEmitter = require('events');

const BASE_URL = 'http://localhost:3000/api';
const POLL_INTERVAL = 5000; // 5 seconds

class SessionMonitor extends EventEmitter {
  constructor(baseUrl = BASE_URL) {
    super();
    this.baseUrl = baseUrl;
    this.trackedSessions = new Map();
    this.isRunning = false;
  }

  async getSessions() {
    const response = await axios.get(`${this.baseUrl}/data/sessions`, {
      params: { limit: 50 }
    });
    return response.data.sessions;
  }

  async getSessionSummary(sessionId) {
    const response = await axios.get(
      `${this.baseUrl}/analytics/sessions/${sessionId}/summary`
    );
    return response.data;
  }

  async getPitches(sessionId) {
    const response = await axios.get(`${this.baseUrl}/data/pitches`, {
      params: { sessionId, limit: 1000 }
    });
    return response.data.pitches;
  }

  analyzeSessionHealth(summary, pitches) {
    const alerts = [];
    const stats = summary.statistics;

    // Check for low quality pitches
    const qualityDist = summary.qualityDistribution;
    const totalPitches = Object.values(qualityDist).reduce((a, b) => a + b, 0);
    const poorPct = (qualityDist.poor / totalPitches) * 100;

    if (poorPct > 30) {
      alerts.push({
        level: 'warning',
        type: 'quality',
        message: `${poorPct.toFixed(1)}% of pitches are poor quality - check calibration`
      });
    }

    // Check for high uncertainty
    if (summary.avgUncertainty > 0.5) {
      alerts.push({
        level: 'warning',
        type: 'uncertainty',
        message: `High uncertainty (±${summary.avgUncertainty.toFixed(2)}ft) - recalibrate`
      });
    }

    // Check for pitch height anomalies
    if (stats.avgHeight < 3.0 || stats.avgHeight > 7.0) {
      alerts.push({
        level: 'critical',
        type: 'height',
        message: `Unusual average height: ${stats.avgHeight.toFixed(2)}ft - verify setup`
      });
    }

    // Check for inconsistency
    const cv = (stats.stdDev / stats.avgHeight) * 100;
    if (cv > 20) {
      alerts.push({
        level: 'info',
        type: 'consistency',
        message: `High variation (CV: ${cv.toFixed(1)}%) - review mechanics`
      });
    }

    // Check for low pitch count
    const lastPitch = pitches[pitches.length - 1];
    if (lastPitch) {
      const timeSinceLastPitch = Date.now() - lastPitch.timestamp;
      if (timeSinceLastPitch > 300000 && stats.count > 0) { // 5 minutes
        alerts.push({
          level: 'info',
          type: 'activity',
          message: 'No recent pitch activity - session may be idle'
        });
      }
    }

    return {
      healthy: alerts.filter(a => a.level === 'critical').length === 0,
      alerts
    };
  }

  async monitorSession(sessionId, sessionName) {
    try {
      const [summary, pitches] = await Promise.all([
        this.getSessionSummary(sessionId),
        this.getPitches(sessionId)
      ]);

      const health = this.analyzeSessionHealth(summary, pitches);
      const previousState = this.trackedSessions.get(sessionId);

      // Update tracked state
      this.trackedSessions.set(sessionId, {
        name: sessionName,
        lastCheck: Date.now(),
        pitchCount: summary.statistics.count,
        health
      });

      // Emit events for new alerts
      if (!previousState || previousState.pitchCount !== summary.statistics.count) {
        this.emit('pitchUpdate', {
          sessionId,
          sessionName,
          pitchCount: summary.statistics.count,
          avgHeight: summary.statistics.avgHeight
        });
      }

      if (!health.healthy) {
        health.alerts.forEach(alert => {
          if (alert.level === 'critical') {
            this.emit('criticalAlert', { sessionId, sessionName, alert });
          } else if (alert.level === 'warning') {
            this.emit('warningAlert', { sessionId, sessionName, alert });
          }
        });
      }

      return health;
    } catch (error) {
      this.emit('error', { sessionId, error: error.message });
    }
  }

  async monitorLoop() {
    if (!this.isRunning) return;

    try {
      const sessions = await getSessions();

      // Monitor recent sessions (last 24 hours)
      const recentSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const dayAgo = Date.now() - 86400000;
        return sessionDate.getTime() > dayAgo;
      });

      console.log(`[${new Date().toISOString()}] Monitoring ${recentSessions.length} active sessions`);

      for (const session of recentSessions) {
        await this.monitorSession(session.id, session.name);
      }
    } catch (error) {
      this.emit('error', { context: 'monitorLoop', error: error.message });
    }

    // Schedule next check
    setTimeout(() => this.monitorLoop(), POLL_INTERVAL);
  }

  start() {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }

    console.log('🤖 Session Monitor Starting...');
    console.log(`📊 Polling every ${POLL_INTERVAL / 1000} seconds\n`);

    this.isRunning = true;
    this.monitorLoop();
  }

  stop() {
    console.log('\n🛑 Session Monitor Stopping...');
    this.isRunning = false;
    this.trackedSessions.clear();
  }
}

// Main execution
async function main() {
  const monitor = new SessionMonitor();

  // Set up event handlers
  monitor.on('pitchUpdate', ({ sessionName, pitchCount, avgHeight }) => {
    console.log(`✅ ${sessionName}: ${pitchCount} pitches, avg ${avgHeight.toFixed(2)}ft`);
  });

  monitor.on('warningAlert', ({ sessionName, alert }) => {
    console.warn(`⚠️  ${sessionName}: ${alert.message}`);
  });

  monitor.on('criticalAlert', ({ sessionName, alert }) => {
    console.error(`🚨 ${sessionName}: ${alert.message}`);
  });

  monitor.on('error', ({ context, sessionId, error }) => {
    console.error(`❌ Error${context ? ` (${context})` : ''}: ${error}`);
  });

  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });

  // Start monitoring
  monitor.start();
}

// Export for use as module
module.exports = SessionMonitor;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
```

### Usage

```bash
# Install dependencies
npm install axios

# Run monitor
node session_monitor.js

# Output:
# 🤖 Session Monitor Starting...
# 📊 Polling every 5 seconds
#
# [2025-10-23T12:00:00.000Z] Monitoring 2 active sessions
# ✅ Morning Practice: 45 pitches, avg 5.12ft
# ⚠️  Evening Drills: 30.5% of pitches are poor quality - check calibration
```

### Run as Background Service (systemd)

```ini
# /etc/systemd/system/pitch-monitor.service
[Unit]
Description=Pitch Height Tracker Session Monitor
After=network.target

[Service]
Type=simple
User=tracker
WorkingDirectory=/home/tracker
ExecStart=/usr/bin/node /home/tracker/session_monitor.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable pitch-monitor
sudo systemctl start pitch-monitor
sudo systemctl status pitch-monitor
```

---

## CLI Tool: Batch Data Export

**Use Case**: Export multiple sessions to CSV files for external analysis.

### Complete Implementation

```bash
#!/bin/bash
#
# Batch Data Export CLI
# Export multiple sessions to CSV files
#

set -e

BASE_URL="http://localhost:3000/api"
OUTPUT_DIR="./exports"
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Batch export pitch sessions to CSV files

OPTIONS:
    -d, --days DAYS       Export sessions from last N days (default: 7)
    -o, --output DIR      Output directory (default: ./exports)
    -s, --session ID      Export specific session by ID
    -a, --all             Export all sessions
    -f, --format FORMAT   Export format: csv or json (default: csv)
    -v, --verbose         Verbose output
    -h, --help            Show this help message

EXAMPLES:
    # Export last 7 days
    $0 -d 7

    # Export all sessions to custom directory
    $0 --all --output /tmp/pitch-exports

    # Export specific session
    $0 --session session_123

    # Export as JSON
    $0 --days 30 --format json
EOF
    exit 1
}

log() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}[INFO]${NC} $1"
    fi
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Parse command line arguments
DAYS=7
FORMAT="csv"
SESSION_ID=""
ALL_SESSIONS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--days)
            DAYS="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -s|--session)
            SESSION_ID="$2"
            shift 2
            ;;
        -a|--all)
            ALL_SESSIONS=true
            shift
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            error "Unknown option: $1"
            usage
            ;;
    esac
done

# Create output directory
mkdir -p "$OUTPUT_DIR"
log "Output directory: $OUTPUT_DIR"

# Export specific session
export_session() {
    local session_id=$1
    local session_name=$2

    log "Exporting session: $session_name (ID: $session_id)"

    # Sanitize filename
    local filename=$(echo "$session_name" | tr ' ' '_' | tr -cd '[:alnum:]_-')
    local output_file="$OUTPUT_DIR/${filename}_${session_id:0:8}.$FORMAT"

    # Make API request
    local url="$BASE_URL/data/sessions/$session_id/export?format=$FORMAT"

    if curl -sf "$url" -o "$output_file"; then
        echo -e "${GREEN}✓${NC} Exported: $output_file"
        return 0
    else
        error "Failed to export session: $session_id"
        return 1
    fi
}

# Get sessions
get_sessions() {
    local params=""

    if [ "$ALL_SESSIONS" = false ] && [ -z "$SESSION_ID" ]; then
        local date_from=$(date -u -d "$DAYS days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v-${DAYS}d +"%Y-%m-%dT%H:%M:%SZ")
        params="?dateFrom=$date_from"
    fi

    curl -sf "$BASE_URL/data/sessions$params" | jq -r '.sessions'
}

# Main execution
main() {
    echo "🚀 Batch Data Export Starting..."
    echo ""

    # Health check
    log "Checking API health..."
    if ! curl -sf "$BASE_URL/health/ping" > /dev/null; then
        error "API is not responding at $BASE_URL"
        exit 1
    fi
    log "API is healthy"

    # Export specific session
    if [ -n "$SESSION_ID" ]; then
        log "Fetching session details..."
        session_json=$(curl -sf "$BASE_URL/data/sessions/$SESSION_ID")

        if [ $? -ne 0 ]; then
            error "Session not found: $SESSION_ID"
            exit 1
        fi

        session_name=$(echo "$session_json" | jq -r '.name')
        export_session "$SESSION_ID" "$session_name"

        echo ""
        echo -e "${GREEN}✅ Export complete${NC}"
        exit 0
    fi

    # Export multiple sessions
    log "Fetching sessions..."
    sessions=$(get_sessions)

    if [ -z "$sessions" ] || [ "$sessions" = "null" ]; then
        warn "No sessions found"
        exit 0
    fi

    total=$(echo "$sessions" | jq 'length')
    echo "Found $total sessions"
    echo ""

    # Export each session
    success=0
    failed=0

    echo "$sessions" | jq -c '.[]' | while read -r session; do
        session_id=$(echo "$session" | jq -r '.id')
        session_name=$(echo "$session" | jq -r '.name')

        if export_session "$session_id" "$session_name"; then
            ((success++)) || true
        else
            ((failed++)) || true
        fi
    done

    echo ""
    echo "================================"
    echo "Export Summary"
    echo "================================"
    echo "Total Sessions: $total"
    echo -e "${GREEN}Successful: $success${NC}"

    if [ $failed -gt 0 ]; then
        echo -e "${RED}Failed: $failed${NC}"
    fi

    echo "Output Directory: $OUTPUT_DIR"
    echo ""
    echo -e "${GREEN}✅ Export complete${NC}"
}

# Run main function
main
```

### Usage

```bash
# Make executable
chmod +x batch_export.sh

# Export last 7 days
./batch_export.sh -d 7

# Export all sessions to custom directory
./batch_export.sh --all --output /tmp/exports

# Export specific session
./batch_export.sh --session session_abc123

# Export as JSON with verbose output
./batch_export.sh --days 30 --format json --verbose

# Output:
# 🚀 Batch Data Export Starting...
#
# Found 5 sessions
#
# ✓ Exported: ./exports/Morning_Practice_session_12.csv
# ✓ Exported: ./exports/Evening_Drills_session_34.csv
# ...
```

---

## Webhook Integration: Real-time Notifications

**Use Case**: Send webhook notifications when specific events occur (e.g., new session created, poor quality detected).

### Complete Implementation

```javascript
/**
 * Webhook Integration Service
 * Sends real-time notifications via webhooks
 */

const axios = require('axios');
const crypto = require('crypto');

class WebhookService {
  constructor(webhookUrl, secret = null) {
    this.webhookUrl = webhookUrl;
    this.secret = secret;
  }

  /**
   * Generate HMAC signature for webhook security
   */
  generateSignature(payload) {
    if (!this.secret) return null;

    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Send webhook notification
   */
  async send(event, data) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'PitchTracker-Webhook/1.0'
    };

    // Add signature if secret is configured
    const signature = this.generateSignature(payload);
    if (signature) {
      headers['X-Webhook-Signature'] = signature;
    }

    try {
      const response = await axios.post(this.webhookUrl, payload, {
        headers,
        timeout: 5000
      });

      console.log(`✅ Webhook sent: ${event} (Status: ${response.status})`);
      return { success: true, status: response.status };
    } catch (error) {
      console.error(`❌ Webhook failed: ${event}`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Event-specific methods
  async notifySessionCreated(session) {
    return this.send('session.created', {
      sessionId: session.id,
      name: session.name,
      date: session.date,
      pitcherName: session.pitcherName
    });
  }

  async notifySessionCompleted(sessionId, summary) {
    return this.send('session.completed', {
      sessionId,
      pitchCount: summary.statistics.count,
      avgHeight: summary.statistics.avgHeight,
      avgUncertainty: summary.avgUncertainty
    });
  }

  async notifyQualityAlert(sessionId, alert) {
    return this.send('quality.alert', {
      sessionId,
      level: alert.level,
      type: alert.type,
      message: alert.message
    });
  }

  async notifyPitchAdded(sessionId, pitch) {
    return this.send('pitch.added', {
      sessionId,
      pitchId: pitch.id,
      height: pitch.height,
      uncertainty: pitch.uncertainty,
      qualityScore: pitch.qualityScore
    });
  }
}

/**
 * Webhook Manager
 * Monitors MCP API and triggers webhooks
 */
class WebhookManager {
  constructor(mcpBaseUrl, webhookUrls) {
    this.mcpBaseUrl = mcpBaseUrl;
    this.webhooks = webhookUrls.map(config =>
      new WebhookService(config.url, config.secret)
    );
    this.trackedSessions = new Map();
  }

  async broadcastToWebhooks(method, ...args) {
    const promises = this.webhooks.map(webhook =>
      webhook[method](...args).catch(err => ({ success: false, error: err.message }))
    );
    return Promise.all(promises);
  }

  async checkForNewSessions() {
    try {
      const response = await axios.get(`${this.mcpBaseUrl}/data/sessions`, {
        params: { limit: 10 }
      });

      const sessions = response.data.sessions;

      for (const session of sessions) {
        if (!this.trackedSessions.has(session.id)) {
          console.log(`🆕 New session detected: ${session.name}`);
          await this.broadcastToWebhooks('notifySessionCreated', session);
          this.trackedSessions.set(session.id, { notified: true, pitchCount: 0 });
        }
      }
    } catch (error) {
      console.error('Error checking for new sessions:', error.message);
    }
  }

  async checkSessionQuality(sessionId) {
    try {
      const [summary, pitches] = await Promise.all([
        axios.get(`${this.mcpBaseUrl}/analytics/sessions/${sessionId}/summary`),
        axios.get(`${this.mcpBaseUrl}/data/pitches`, { params: { sessionId } })
      ]);

      const qualityDist = summary.data.qualityDistribution;
      const total = Object.values(qualityDist).reduce((a, b) => a + b, 0);
      const poorPct = (qualityDist.poor / total) * 100;

      // Alert if >30% poor quality
      if (poorPct > 30) {
        await this.broadcastToWebhooks('notifyQualityAlert', sessionId, {
          level: 'warning',
          type: 'quality',
          message: `${poorPct.toFixed(1)}% of pitches are poor quality`
        });
      }

      // Check for new pitches
      const trackedSession = this.trackedSessions.get(sessionId);
      if (trackedSession && pitches.data.pitches.length > trackedSession.pitchCount) {
        const newPitches = pitches.data.pitches.slice(trackedSession.pitchCount);
        for (const pitch of newPitches) {
          await this.broadcastToWebhooks('notifyPitchAdded', sessionId, pitch);
        }
        trackedSession.pitchCount = pitches.data.pitches.length;
      }
    } catch (error) {
      console.error(`Error checking session quality: ${sessionId}`, error.message);
    }
  }

  async start(pollInterval = 10000) {
    console.log('🤖 Webhook Manager Starting...');
    console.log(`📡 Broadcasting to ${this.webhooks.length} webhook(s)`);
    console.log(`⏱️  Polling every ${pollInterval / 1000} seconds\n`);

    setInterval(async () => {
      await this.checkForNewSessions();

      for (const [sessionId] of this.trackedSessions) {
        await this.checkSessionQuality(sessionId);
      }
    }, pollInterval);
  }
}

// Example usage
const webhookConfig = [
  {
    url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    secret: 'your-webhook-secret-key'
  },
  {
    url: 'https://discord.com/api/webhooks/YOUR/WEBHOOK',
    secret: null
  }
];

const manager = new WebhookManager(
  'http://localhost:3000/api',
  webhookConfig
);

manager.start();

module.exports = { WebhookService, WebhookManager };
```

### Slack Integration Example

```javascript
/**
 * Slack-specific webhook formatter
 */
class SlackWebhook extends WebhookService {
  formatSlackMessage(event, data) {
    let blocks = [];

    switch (event) {
      case 'session.created':
        blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🆕 New Session Started*\n*${data.name}*`
            }
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `Pitcher: ${data.pitcherName || 'N/A'}` },
              { type: 'mrkdwn', text: `Date: ${data.date}` }
            ]
          }
        ];
        break;

      case 'session.completed':
        blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*✅ Session Completed*`
            }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Pitches:*\n${data.pitchCount}` },
              { type: 'mrkdwn', text: `*Avg Height:*\n${data.avgHeight.toFixed(2)}ft` },
              { type: 'mrkdwn', text: `*Uncertainty:*\n±${data.avgUncertainty.toFixed(2)}ft` }
            ]
          }
        ];
        break;

      case 'quality.alert':
        const emoji = data.level === 'critical' ? '🚨' : '⚠️';
        blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${emoji} Quality Alert*\n${data.message}`
            }
          }
        ];
        break;
    }

    return { blocks };
  }

  async send(event, data) {
    const slackPayload = this.formatSlackMessage(event, data);
    return super.send(event, slackPayload);
  }
}
```

---

## ML Pipeline: Trend Prediction

**Use Case**: Use machine learning to predict pitch performance trends.

### Complete Implementation (Python + scikit-learn)

```python
#!/usr/bin/env python3
"""
ML Trend Prediction Pipeline
Predicts pitch performance trends using historical data
"""

import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

BASE_URL = "http://localhost:3000/api"

class TrendPredictor:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.scaler = StandardScaler()
        self.model = LinearRegression()

    def fetch_trend_data(self, days=30):
        """Fetch trend data from API"""
        date_from = (datetime.now() - timedelta(days=days)).isoformat()

        response = requests.get(f"{self.base_url}/analytics/trends", params={
            "dateFrom": date_from,
            "metric": "avgHeight"
        })
        return response.json()

    def fetch_all_sessions(self, days=30):
        """Fetch all sessions for analysis"""
        date_from = (datetime.now() - timedelta(days=days)).isoformat()

        response = requests.get(f"{self.base_url}/data/sessions", params={
            "dateFrom": date_from,
            "limit": 1000
        })
        return response.json()["sessions"]

    def prepare_dataset(self, sessions):
        """Prepare dataset for ML"""
        data = []

        for session in sessions:
            try:
                summary_resp = requests.get(
                    f"{self.base_url}/analytics/sessions/{session['id']}/summary"
                )
                summary = summary_resp.json()

                data.append({
                    "date": session["date"],
                    "timestamp": pd.to_datetime(session["date"]).timestamp(),
                    "pitch_count": summary["statistics"]["count"],
                    "avg_height": summary["statistics"]["avgHeight"],
                    "std_dev": summary["statistics"]["stdDev"],
                    "avg_uncertainty": summary["avgUncertainty"],
                    "quality_excellent_pct": (summary["qualityDistribution"]["excellent"] /
                                            summary["statistics"]["count"] * 100)
                })
            except Exception as e:
                print(f"Error processing session {session['id']}: {e}")
                continue

        return pd.DataFrame(data)

    def train_model(self, df):
        """Train prediction model"""
        # Features: timestamp, pitch_count, std_dev, avg_uncertainty
        X = df[["timestamp", "pitch_count", "std_dev", "avg_uncertainty"]].values
        y = df["avg_height"].values

        # Standardize features
        X_scaled = self.scaler.fit_transform(X)

        # Train model
        self.model.fit(X_scaled, y)

        # Calculate R² score
        score = self.model.score(X_scaled, y)
        print(f"Model R² score: {score:.3f}")

        return score

    def predict_future(self, df, days_ahead=7):
        """Predict future performance"""
        # Get latest session stats
        latest = df.iloc[-1]

        predictions = []
        current_timestamp = latest["timestamp"]
        day_seconds = 86400

        for day in range(1, days_ahead + 1):
            future_timestamp = current_timestamp + (day * day_seconds)

            # Use average values for other features
            avg_pitch_count = df["pitch_count"].mean()
            avg_std_dev = df["std_dev"].mean()
            avg_uncertainty = df["avg_uncertainty"].mean()

            features = np.array([[
                future_timestamp,
                avg_pitch_count,
                avg_std_dev,
                avg_uncertainty
            ]])

            features_scaled = self.scaler.transform(features)
            predicted_height = self.model.predict(features_scaled)[0]

            predictions.append({
                "date": datetime.fromtimestamp(future_timestamp).date(),
                "predicted_height": predicted_height
            })

        return predictions

    def analyze_trends(self, df):
        """Analyze performance trends"""
        # Calculate moving averages
        df["ma_7day"] = df["avg_height"].rolling(window=min(7, len(df))).mean()
        df["ma_30day"] = df["avg_height"].rolling(window=min(30, len(df))).mean()

        # Calculate trend direction
        recent_avg = df.tail(7)["avg_height"].mean()
        overall_avg = df["avg_height"].mean()

        trend = "improving" if recent_avg > overall_avg else "declining"
        trend_magnitude = abs(recent_avg - overall_avg)

        # Calculate consistency trend
        recent_std = df.tail(7)["std_dev"].mean()
        overall_std = df["std_dev"].mean()

        consistency_trend = "improving" if recent_std < overall_std else "declining"

        return {
            "trend": trend,
            "trend_magnitude": trend_magnitude,
            "recent_avg": recent_avg,
            "overall_avg": overall_avg,
            "consistency_trend": consistency_trend,
            "recent_std": recent_std,
            "overall_std": overall_std
        }

    def visualize_trends(self, df, predictions, save_path="trend_prediction.png"):
        """Create visualization of trends and predictions"""
        plt.figure(figsize=(12, 6))

        # Convert timestamps to dates
        dates = pd.to_datetime(df["timestamp"], unit='s')
        pred_dates = [p["date"] for p in predictions]
        pred_heights = [p["predicted_height"] for p in predictions]

        # Plot actual data
        plt.plot(dates, df["avg_height"], 'o-', label='Actual', linewidth=2)

        # Plot moving averages
        if "ma_7day" in df.columns:
            plt.plot(dates, df["ma_7day"], '--', label='7-day MA', alpha=0.7)

        # Plot predictions
        plt.plot(pred_dates, pred_heights, 's--',
                label='Predicted', color='red', linewidth=2)

        plt.xlabel('Date')
        plt.ylabel('Average Pitch Height (ft)')
        plt.title('Pitch Height Trends and Predictions')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150)
        print(f"📊 Visualization saved: {save_path}")

    def run_pipeline(self, days=30, predict_days=7):
        """Run complete ML pipeline"""
        print("🤖 ML Trend Prediction Pipeline Starting...")
        print(f"📅 Analyzing last {days} days\n")

        # Fetch data
        print("📥 Fetching session data...")
        sessions = self.fetch_all_sessions(days)
        print(f"✅ Found {len(sessions)} sessions\n")

        # Prepare dataset
        print("🔧 Preparing dataset...")
        df = self.prepare_dataset(sessions)
        print(f"✅ Dataset ready: {len(df)} sessions with complete data\n")

        if len(df) < 5:
            print("❌ Insufficient data for ML (need at least 5 sessions)")
            return None

        # Train model
        print("🎓 Training prediction model...")
        score = self.train_model(df)
        print()

        # Analyze trends
        print("📈 Analyzing trends...")
        trends = self.analyze_trends(df)
        print(f"✅ Performance is {trends['trend']} (magnitude: {trends['trend_magnitude']:.2f}ft)")
        print(f"✅ Consistency is {trends['consistency_trend']}\n")

        # Make predictions
        print(f"🔮 Predicting next {predict_days} days...")
        predictions = self.predict_future(df, predict_days)

        print("\nPredictions:")
        for pred in predictions:
            print(f"  {pred['date']}: {pred['predicted_height']:.2f}ft")
        print()

        # Visualize
        print("📊 Creating visualization...")
        self.visualize_trends(df, predictions)

        print("\n✅ Pipeline complete")

        return {
            "model_score": score,
            "trends": trends,
            "predictions": predictions
        }


def main():
    predictor = TrendPredictor()
    results = predictor.run_pipeline(days=30, predict_days=7)

    if results:
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        print(f"Model Performance: R² = {results['model_score']:.3f}")
        print(f"Overall Trend: {results['trends']['trend'].upper()}")
        print(f"Next 7 days avg prediction: {np.mean([p['predicted_height'] for p in results['predictions']]):.2f}ft")


if __name__ == "__main__":
    main()
```

### Usage

```bash
# Install dependencies
pip install requests numpy pandas scikit-learn matplotlib

# Run ML pipeline
python trend_predictor.py

# Output:
# 🤖 ML Trend Prediction Pipeline Starting...
# 📅 Analyzing last 30 days
#
# 📥 Fetching session data...
# ✅ Found 15 sessions
#
# 🔧 Preparing dataset...
# ✅ Dataset ready: 15 sessions with complete data
#
# 🎓 Training prediction model...
# Model R² score: 0.847
#
# 📈 Analyzing trends...
# ✅ Performance is improving (magnitude: 0.15ft)
# ✅ Consistency is improving
#
# 🔮 Predicting next 7 days...
#
# Predictions:
#   2025-10-24: 5.18ft
#   2025-10-25: 5.20ft
#   2025-10-26: 5.22ft
# ...
```

---

## Scheduled Reports: Email Summary

**Use Case**: Send weekly email reports with performance summaries.

### Complete Implementation (Python + SendGrid)

```python
#!/usr/bin/env python3
"""
Weekly Report Email Service
Sends automated weekly performance reports via email
"""

import requests
import os
from datetime import datetime, timedelta
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64
import json

BASE_URL = "http://localhost:3000/api"
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "reports@pitchtracker.com")
TO_EMAIL = os.environ.get("TO_EMAIL")

class WeeklyReportService:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.sg = SendGridAPIClient(SENDGRID_API_KEY)

    def fetch_weekly_data(self):
        """Fetch data from last 7 days"""
        date_from = (datetime.now() - timedelta(days=7)).isoformat()

        response = requests.get(f"{self.base_url}/data/sessions", params={
            "dateFrom": date_from,
            "limit": 100
        })
        return response.json()["sessions"]

    def get_session_summaries(self, sessions):
        """Get summaries for all sessions"""
        summaries = []

        for session in sessions:
            try:
                response = requests.get(
                    f"{self.base_url}/analytics/sessions/{session['id']}/summary"
                )
                summary = response.json()
                summaries.append({
                    "session": session,
                    "summary": summary
                })
            except Exception as e:
                print(f"Error fetching summary for {session['id']}: {e}")

        return summaries

    def calculate_weekly_stats(self, summaries):
        """Calculate weekly aggregate statistics"""
        if not summaries:
            return None

        total_pitches = sum(s["summary"]["statistics"]["count"] for s in summaries)
        avg_heights = [s["summary"]["statistics"]["avgHeight"] for s in summaries]
        overall_avg = sum(avg_heights) / len(avg_heights)

        # Calculate quality distribution
        total_quality = {
            "excellent": 0,
            "good": 0,
            "fair": 0,
            "poor": 0
        }

        for s in summaries:
            for key in total_quality:
                total_quality[key] += s["summary"]["qualityDistribution"][key]

        total_count = sum(total_quality.values())
        quality_pct = {
            k: (v / total_count * 100) if total_count > 0 else 0
            for k, v in total_quality.items()
        }

        # Find best and worst sessions
        best_session = max(summaries, key=lambda s: s["summary"]["statistics"]["avgHeight"])
        worst_session = min(summaries, key=lambda s: s["summary"]["statistics"]["avgHeight"])

        return {
            "total_sessions": len(summaries),
            "total_pitches": total_pitches,
            "overall_avg_height": overall_avg,
            "quality_distribution": quality_pct,
            "best_session": best_session,
            "worst_session": worst_session
        }

    def export_session_csv(self, session_id):
        """Export session as CSV"""
        response = requests.get(
            f"{self.base_url}/data/sessions/{session_id}/export",
            params={"format": "csv"}
        )
        return response.text

    def generate_html_report(self, stats, summaries):
        """Generate HTML email report"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .stat-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }}
                .stat-card {{
                    background: #f7fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }}
                .stat-value {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    margin: 10px 0;
                }}
                .stat-label {{
                    font-size: 14px;
                    color: #718096;
                    text-transform: uppercase;
                }}
                .quality-bar {{
                    background: #e2e8f0;
                    height: 30px;
                    border-radius: 15px;
                    overflow: hidden;
                    margin: 10px 0;
                    display: flex;
                }}
                .quality-segment {{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }}
                .excellent {{ background: #48bb78; }}
                .good {{ background: #4299e1; }}
                .fair {{ background: #ed8936; }}
                .poor {{ background: #f56565; }}
                .session-list {{
                    margin: 30px 0;
                }}
                .session-item {{
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 8px;
                }}
                .footer {{
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    color: #718096;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚾ Weekly Pitch Report</h1>
                <p>Performance Summary for {datetime.now().strftime('%B %d, %Y')}</p>
            </div>

            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Sessions</div>
                    <div class="stat-value">{stats['total_sessions']}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Pitches</div>
                    <div class="stat-value">{stats['total_pitches']}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Height</div>
                    <div class="stat-value">{stats['overall_avg_height']:.2f}ft</div>
                </div>
            </div>

            <h2>📊 Quality Distribution</h2>
            <div class="quality-bar">
                <div class="quality-segment excellent" style="width: {stats['quality_distribution']['excellent']:.1f}%">
                    {stats['quality_distribution']['excellent']:.0f}%
                </div>
                <div class="quality-segment good" style="width: {stats['quality_distribution']['good']:.1f}%">
                    {stats['quality_distribution']['good']:.0f}%
                </div>
                <div class="quality-segment fair" style="width: {stats['quality_distribution']['fair']:.1f}%">
                    {stats['quality_distribution']['fair']:.0f}%
                </div>
                <div class="quality-segment poor" style="width: {stats['quality_distribution']['poor']:.1f}%">
                    {stats['quality_distribution']['poor']:.0f}%
                </div>
            </div>

            <h2>🏆 Best Session</h2>
            <div class="session-item">
                <strong>{stats['best_session']['session']['name']}</strong><br>
                Average Height: {stats['best_session']['summary']['statistics']['avgHeight']:.2f}ft<br>
                Pitches: {stats['best_session']['summary']['statistics']['count']}
            </div>

            <h2>📈 All Sessions This Week</h2>
            <div class="session-list">
        """

        for item in summaries:
            session = item["session"]
            summary = item["summary"]
            html += f"""
                <div class="session-item">
                    <strong>{session['name']}</strong> - {session['date']}<br>
                    Pitches: {summary['statistics']['count']} |
                    Avg: {summary['statistics']['avgHeight']:.2f}ft ± {summary['avgUncertainty']:.2f}ft
                </div>
            """

        html += """
            </div>

            <div class="footer">
                <p>Generated by Pitch Height Tracker Pro</p>
                <p>This is an automated report. Reply to this email for support.</p>
            </div>
        </body>
        </html>
        """

        return html

    def send_email(self, to_email, subject, html_content, attachments=None):
        """Send email via SendGrid"""
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )

        # Add attachments if provided
        if attachments:
            for attachment in attachments:
                message.add_attachment(attachment)

        try:
            response = self.sg.send(message)
            print(f"✅ Email sent (Status: {response.status_code})")
            return True
        except Exception as e:
            print(f"❌ Email failed: {str(e)}")
            return False

    def generate_and_send_report(self, to_email):
        """Generate and send weekly report"""
        print("🤖 Weekly Report Service Starting...")
        print(f"📅 Generating report for last 7 days\n")

        # Fetch data
        print("📥 Fetching session data...")
        sessions = self.fetch_weekly_data()
        print(f"✅ Found {len(sessions)} sessions\n")

        if not sessions:
            print("ℹ️  No sessions this week - skipping report")
            return

        # Get summaries
        print("📊 Calculating statistics...")
        summaries = self.get_session_summaries(sessions)
        stats = self.calculate_weekly_stats(summaries)
        print("✅ Statistics ready\n")

        # Generate HTML
        print("📝 Generating HTML report...")
        html = self.generate_html_report(stats, summaries)
        print("✅ HTML generated\n")

        # Prepare attachments (CSV of best session)
        print("📎 Preparing attachments...")
        best_session_id = stats["best_session"]["session"]["id"]
        csv_data = self.export_session_csv(best_session_id)

        attachment = Attachment(
            FileContent(base64.b64encode(csv_data.encode()).decode()),
            FileName("best_session.csv"),
            FileType("text/csv"),
            Disposition("attachment")
        )
        print("✅ Attachments ready\n")

        # Send email
        print(f"📧 Sending report to {to_email}...")
        subject = f"⚾ Weekly Pitch Report - {datetime.now().strftime('%b %d, %Y')}"
        self.send_email(to_email, subject, html, [attachment])

        print("\n✅ Report complete")


def main():
    if not SENDGRID_API_KEY:
        print("❌ SENDGRID_API_KEY environment variable not set")
        return

    if not TO_EMAIL:
        print("❌ TO_EMAIL environment variable not set")
        return

    service = WeeklyReportService()
    service.generate_and_send_report(TO_EMAIL)


if __name__ == "__main__":
    main()
```

### Schedule with Cron

```bash
# Add to crontab (every Monday at 9 AM)
0 9 * * 1 /usr/bin/python3 /path/to/weekly_report.py

# Environment variables in cron
0 9 * * 1 export SENDGRID_API_KEY=your_key && export TO_EMAIL=coach@example.com && /usr/bin/python3 /path/to/weekly_report.py
```

---

## Integration Summary

| Workflow | Language | Use Case | Complexity |
|----------|----------|----------|------------|
| Automated Pitch Analysis | Python | Coaching insights | Medium |
| Session Monitoring | Node.js | Real-time alerts | Medium |
| Batch Data Export | Bash | Bulk export | Low |
| Webhook Integration | Node.js | Event notifications | Medium |
| ML Trend Prediction | Python | Performance forecasting | High |
| Scheduled Reports | Python | Weekly summaries | High |

---

## Best Practices

### Error Handling
- Always handle API request failures gracefully
- Implement retry logic with exponential backoff
- Log errors for debugging

### Performance
- Use pagination for large datasets
- Implement caching where appropriate
- Batch operations when possible

### Security
- Store API keys in environment variables
- Use HMAC signatures for webhooks
- Validate all inputs

### Monitoring
- Track agent execution times
- Monitor API response times
- Set up alerts for failures

---

## Next Steps

1. **Customize workflows** for your specific needs
2. **Deploy agents** to production environments
3. **Monitor performance** and optimize
4. **Extend functionality** with new endpoints

---

*Last modified by: Claude Code on October 23, 2025*
