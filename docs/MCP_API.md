# MCP API Documentation

**Pitch Height Tracker Pro - Agent Integration API**
**Version:** 1.0.0
**Last Updated:** October 23, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Endpoints](#endpoints)
   - [Health](#health-endpoints)
   - [Data Export](#data-export-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Session Management](#session-management-endpoints)
   - [Configuration](#configuration-endpoints)
8. [Data Models](#data-models)
9. [Examples](#examples)
10. [SDKs & Client Libraries](#sdks--client-libraries)

---

## Overview

The MCP (Model Context Protocol) API provides REST endpoints for external agents and automation tools to interact with the Pitch Height Tracker Pro system.

**Capabilities:**
- Query and export pitch data
- Generate statistical analyses
- Manage tracking sessions
- Configure app settings
- Monitor system health

---

## Authentication

### Current: No Authentication Required

For development and testing, no authentication is required.

### Production: API Key Authentication (Recommended)

Add `X-API-Key` header to all requests:

```http
X-API-Key: your-api-key-here
```

**Example:**
```bash
curl -H "X-API-Key: YOUR_KEY" http://localhost:3000/api/data/sessions
```

### Future: JWT Authentication

OAuth 2.0 / JWT tokens for user-specific operations.

---

## Base URL

**Development:** `http://localhost:3000/api`
**Production:** `https://api.pitchheighttracker.com/api` (when deployed)

---

## Response Format

All responses are JSON.

**Success Response:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-23T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response

```json
{
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND",
  "statusCode": 404,
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

---

## Rate Limiting

**Limits:**
- 100 requests per 15 minutes per IP address
- Burst limit: 20 requests per minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698072000
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

---

## Endpoints

### Health Endpoints

#### GET /api/health

Check server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T12:00:00.000Z",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "100MB",
    "rss": "120MB"
  },
  "version": "1.0.0"
}
```

#### GET /api/health/ping

Simple ping for monitoring.

**Response:**
```json
{
  "pong": true,
  "timestamp": 1698072000000
}
```

---

### Data Export Endpoints

#### GET /api/data/sessions

List all tracking sessions with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 100 | Number of sessions to return |
| offset | integer | 0 | Pagination offset |
| dateFrom | string | null | Filter by start date (ISO 8601) |
| dateTo | string | null | Filter by end date (ISO 8601) |

**Example:**
```bash
GET /api/data/sessions?limit=10&offset=0&dateFrom=2025-10-01
```

**Response:**
```json
{
  "total": 50,
  "limit": 10,
  "offset": 0,
  "sessions": [
    {
      "id": "session_123",
      "name": "Practice Session",
      "date": "2025-10-23",
      "pitcherName": "John Doe",
      "location": "Field A",
      "pitchCount": 45,
      "createdAt": 1698072000000,
      "updatedAt": 1698072000000
    }
  ],
  "filters": {
    "dateFrom": "2025-10-01",
    "dateTo": null
  }
}
```

---

#### GET /api/data/sessions/:sessionId

Get detailed session data including all pitches.

**Path Parameters:**
- `sessionId` (string, required): Session ID

**Response:**
```json
{
  "session": {
    "id": "session_123",
    "name": "Practice Session",
    "date": "2025-10-23",
    "pitcherName": "John Doe",
    "location": "Field A",
    "notes": "Good session overall",
    "pitchCount": 45,
    "createdAt": 1698072000000,
    "updatedAt": 1698072000000
  },
  "pitches": [
    {
      "id": "pitch_456",
      "height": 4.5,
      "uncertainty": 0.08,
      "timestamp": 1698072000000,
      "qualityScore": 92,
      "ballPosition": { "x": 150, "y": 300 },
      "calibrationId": "cal_789",
      "metadata": {}
    }
  ],
  "statistics": {
    "minHeight": 3.2,
    "maxHeight": 5.8,
    "avgHeight": 4.52,
    "stdDev": 0.45,
    "variance": 0.20,
    "medianHeight": 4.50,
    "percentile25": 4.10,
    "percentile75": 4.90,
    "totalPitches": 45
  }
}
```

---

#### GET /api/data/sessions/:sessionId/export

Export session data in specified format.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| format | string | json | Export format: 'json' or 'csv' |

**Example:**
```bash
GET /api/data/sessions/session_123/export?format=csv
```

**CSV Response:**
```csv
Session: Practice Session
Date: 2025-10-23
Pitcher: John Doe

Statistics
Average Height,4.52,ft
Min Height,3.20,ft
Max Height,5.80,ft

Pitch Data
Pitch #,Timestamp,Height (ft),Uncertainty (±ft),Quality Score
1,2025-10-23T14:30:00.000Z,4.50,0.08,92
...
```

---

#### GET /api/data/pitches

Query pitches with filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sessionId | string | null | Filter by session ID |
| minHeight | number | null | Minimum height filter (feet) |
| maxHeight | number | null | Maximum height filter (feet) |
| minQuality | number | null | Minimum quality score (0-100) |
| limit | integer | 100 | Number of pitches to return |
| offset | integer | 0 | Pagination offset |

**Example:**
```bash
GET /api/data/pitches?sessionId=session_123&minQuality=80&limit=20
```

**Response:**
```json
{
  "total": 35,
  "limit": 20,
  "offset": 0,
  "pitches": [
    {
      "id": "pitch_456",
      "sessionId": "session_123",
      "height": 4.5,
      "uncertainty": 0.08,
      "timestamp": 1698072000000,
      "qualityScore": 92,
      "ballPosition": { "x": 150, "y": 300 }
    }
  ],
  "filters": {
    "sessionId": "session_123",
    "minHeight": null,
    "maxHeight": null,
    "minQuality": 80
  }
}
```

---

### Analytics Endpoints

#### GET /api/analytics/sessions/:sessionId/summary

Get statistical summary for a session.

**Response:**
```json
{
  "sessionId": "session_123",
  "statistics": {
    "minHeight": 3.2,
    "maxHeight": 5.8,
    "avgHeight": 4.52,
    "stdDev": 0.45,
    "variance": 0.20,
    "medianHeight": 4.50,
    "percentile25": 4.10,
    "percentile75": 4.90,
    "totalPitches": 45
  },
  "avgUncertainty": 0.08,
  "qualityDistribution": {
    "excellent": 15,
    "good": 22,
    "fair": 6,
    "poor": 2
  },
  "pitchFrequency": 2.5
}
```

---

#### GET /api/analytics/sessions/:sessionId/distribution

Get height distribution histogram.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| bins | integer | 10 | Number of histogram bins |

**Response:**
```json
{
  "sessionId": "session_123",
  "bins": 10,
  "histogram": [
    { "binStart": 3.0, "binEnd": 3.5, "count": 2 },
    { "binStart": 3.5, "binEnd": 4.0, "count": 8 },
    { "binStart": 4.0, "binEnd": 4.5, "count": 15 },
    { "binStart": 4.5, "binEnd": 5.0, "count": 12 },
    { "binStart": 5.0, "binEnd": 5.5, "count": 6 },
    { "binStart": 5.5, "binEnd": 6.0, "count": 2 }
  ]
}
```

---

#### GET /api/analytics/compare

Compare statistics between multiple sessions.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessions | string | yes | Comma-separated session IDs |

**Example:**
```bash
GET /api/analytics/compare?sessions=session_123,session_456
```

**Response:**
```json
{
  "sessionIds": ["session_123", "session_456"],
  "comparison": [
    {
      "sessionId": "session_123",
      "name": "Practice Session",
      "avgHeight": 4.52,
      "totalPitches": 45
    },
    {
      "sessionId": "session_456",
      "name": "Game Day",
      "avgHeight": 4.65,
      "totalPitches": 38
    }
  ]
}
```

---

#### GET /api/analytics/trends

Get performance trends over time.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| dateFrom | string | yes | Start date (ISO 8601) |
| dateTo | string | yes | End date (ISO 8601) |
| metric | string | no | Metric to track (default: 'avgHeight') |

**Example:**
```bash
GET /api/analytics/trends?dateFrom=2025-10-01&dateTo=2025-10-23&metric=avgHeight
```

**Response:**
```json
{
  "metric": "avgHeight",
  "dateRange": {
    "from": "2025-10-01",
    "to": "2025-10-23"
  },
  "dataPoints": [
    { "date": "2025-10-01", "value": 4.45 },
    { "date": "2025-10-08", "value": 4.52 },
    { "date": "2025-10-15", "value": 4.60 },
    { "date": "2025-10-23", "value": 4.65 }
  ]
}
```

---

### Session Management Endpoints

#### POST /api/session

Create a new tracking session.

**Request Body:**
```json
{
  "name": "Practice Session",
  "date": "2025-10-23",
  "pitcherName": "John Doe",
  "location": "Field A",
  "notes": "Focus on consistency"
}
```

**Required Fields:** `name`, `date`

**Response:**
```json
{
  "id": "session_123",
  "name": "Practice Session",
  "date": "2025-10-23",
  "pitcherName": "John Doe",
  "location": "Field A",
  "notes": "Focus on consistency",
  "createdAt": 1698072000000,
  "updatedAt": 1698072000000,
  "pitchCount": 0
}
```

---

#### PUT /api/session/:sessionId

Update an existing session.

**Request Body:**
```json
{
  "notes": "Updated notes",
  "location": "Field B"
}
```

**Response:**
```json
{
  "id": "session_123",
  "name": "Practice Session",
  "date": "2025-10-23",
  "pitcherName": "John Doe",
  "location": "Field B",
  "notes": "Updated notes",
  "updatedAt": 1698072001000
}
```

---

#### DELETE /api/session/:sessionId

Delete a session and all associated pitches.

**Response:**
```json
{
  "success": true,
  "sessionId": "session_123",
  "message": "Session deleted successfully"
}
```

---

#### POST /api/session/:sessionId/pitches

Add a single pitch to a session.

**Request Body:**
```json
{
  "height": 4.5,
  "uncertainty": 0.08,
  "qualityScore": 92,
  "ballPosition": { "x": 150, "y": 300 },
  "calibrationId": "cal_789",
  "metadata": { "notes": "Good pitch" }
}
```

**Required Fields:** `height`, `uncertainty`, `qualityScore`, `ballPosition`

**Response:**
```json
{
  "id": "pitch_456",
  "sessionId": "session_123",
  "height": 4.5,
  "uncertainty": 0.08,
  "timestamp": 1698072000000,
  "qualityScore": 92,
  "ballPosition": { "x": 150, "y": 300 },
  "calibrationId": "cal_789",
  "metadata": { "notes": "Good pitch" },
  "createdAt": 1698072000000
}
```

---

#### POST /api/session/:sessionId/pitches/batch

Add multiple pitches at once.

**Request Body:**
```json
{
  "pitches": [
    {
      "height": 4.5,
      "uncertainty": 0.08,
      "qualityScore": 92,
      "ballPosition": { "x": 150, "y": 300 }
    },
    {
      "height": 4.6,
      "uncertainty": 0.07,
      "qualityScore": 95,
      "ballPosition": { "x": 155, "y": 305 }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "pitches": [...]
}
```

---

### Configuration Endpoints

#### GET /api/config

Get current app configuration.

**Response:**
```json
{
  "app": {
    "name": "Pitch Height Tracker Pro",
    "version": "1.0.0",
    "environment": "development"
  },
  "tracking": {
    "yellowHueMin": 20,
    "yellowHueMax": 40,
    "yellowSaturationMin": 100,
    "yellowValueMin": 100,
    "calibrationReferenceHeight": 5.0,
    "minConfidenceThreshold": 70
  },
  "database": {
    "type": "sqlite",
    "maxConnections": 5
  },
  "export": {
    "supportedFormats": ["csv", "json"],
    "maxRecords": 10000
  }
}
```

---

#### PUT /api/config/tracking

Update tracking configuration.

**Request Body:**
```json
{
  "yellowHueMin": 22,
  "calibrationReferenceHeight": 5.5
}
```

**Response:**
```json
{
  "success": true,
  "updated": {
    "yellowHueMin": 22,
    "calibrationReferenceHeight": 5.5
  },
  "message": "Tracking configuration updated"
}
```

---

## Data Models

### Session

```typescript
interface Session {
  id: string;
  name: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  pitcherName?: string;
  location?: string;
  notes?: string;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
  pitchCount?: number; // Computed
}
```

### Pitch

```typescript
interface Pitch {
  id: string;
  sessionId: string;
  height: number; // feet
  uncertainty: number; // ±feet
  timestamp: number; // Unix timestamp (ms)
  qualityScore: number; // 0-100
  ballPosition: { x: number; y: number };
  calibrationId?: string;
  metadata?: {
    pitchType?: string;
    ballType?: string;
    notes?: string;
  };
  createdAt?: number;
}
```

### SessionStatistics

```typescript
interface SessionStatistics {
  minHeight: number;
  maxHeight: number;
  avgHeight: number;
  stdDev: number;
  variance: number;
  medianHeight: number;
  percentile25: number;
  percentile75: number;
  totalPitches: number;
}
```

### QualityDistribution

```typescript
interface QualityDistribution {
  excellent: number; // 90-100
  good: number; // 70-89
  fair: number; // 50-69
  poor: number; // 0-49
}
```

---

## Examples

### Python Example

```python
import requests

BASE_URL = "http://localhost:3000/api"

# Create session
session = requests.post(f"{BASE_URL}/session", json={
    "name": "Practice",
    "date": "2025-10-23",
    "pitcherName": "John Doe"
}).json()

print(f"Created session: {session['id']}")

# Add pitches
pitches = [
    {"height": 4.5, "uncertainty": 0.08, "qualityScore": 92, "ballPosition": {"x": 150, "y": 300}},
    {"height": 4.6, "uncertainty": 0.07, "qualityScore": 95, "ballPosition": {"x": 155, "y": 305}}
]

requests.post(f"{BASE_URL}/session/{session['id']}/pitches/batch", json={"pitches": pitches})

# Get summary
summary = requests.get(f"{BASE_URL}/analytics/sessions/{session['id']}/summary").json()
print(f"Average height: {summary['statistics']['avgHeight']}")

# Export CSV
csv = requests.get(f"{BASE_URL}/data/sessions/{session['id']}/export?format=csv").text
with open("session.csv", "w") as f:
    f.write(csv)
```

### JavaScript Example

```javascript
const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function trackSession() {
  // Create session
  const { data: session } = await axios.post(`${BASE_URL}/session`, {
    name: 'Practice',
    date: '2025-10-23',
    pitcherName: 'John Doe'
  });

  console.log(`Created session: ${session.id}`);

  // Add pitches
  await axios.post(`${BASE_URL}/session/${session.id}/pitches/batch`, {
    pitches: [
      { height: 4.5, uncertainty: 0.08, qualityScore: 92, ballPosition: { x: 150, y: 300 } },
      { height: 4.6, uncertainty: 0.07, qualityScore: 95, ballPosition: { x: 155, y: 305 } }
    ]
  });

  // Get summary
  const { data: summary } = await axios.get(`${BASE_URL}/analytics/sessions/${session.id}/summary`);
  console.log(`Average height: ${summary.statistics.avgHeight}`);
}

trackSession();
```

---

## SDKs & Client Libraries

### Official SDKs (Future)

- **JavaScript/TypeScript**: `@pitchtracker/mcp-client`
- **Python**: `pitch-tracker-client`
- **Ruby**: `pitch_tracker_client`

### Community SDKs

Coming soon!

---

## Support

- **Documentation**: This file
- **GitHub**: https://github.com/onesmartguy/slowpitched-react
- **Issues**: GitHub Issues
- **Email**: support@pitchheighttracker.com

---

*API Documentation v1.0.0 - Last modified by: Claude Code on October 23, 2025*
