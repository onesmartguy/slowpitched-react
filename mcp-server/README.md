# Pitch Height Tracker MCP Server

**Phase 5: Agentic AI Integration**

Model Context Protocol (MCP) server providing REST API endpoints for agent interaction with the Pitch Height Tracker Pro system.

---

## Overview

The MCP server enables external agents and automation tools to:
- Access pitch data and statistics
- Manage tracking sessions
- Export data in various formats
- Query analytics and trends
- Configure app settings

---

## Quick Start

### Installation

```bash
cd mcp-server
pnpm install
```

### Development

```bash
pnpm run dev
```

Server runs on `http://localhost:3000`

### Production

```bash
pnpm run build
pnpm start
```

---

## API Endpoints

### Health Check

**GET /api/health**
- Returns server health status
- Includes uptime and memory usage

**GET /api/health/ping**
- Simple ping endpoint for monitoring

### Data Export

**GET /api/data/sessions**
- List all sessions with pagination
- Query params: `limit`, `offset`, `dateFrom`, `dateTo`

**GET /api/data/sessions/:sessionId**
- Get detailed session data including all pitches

**GET /api/data/sessions/:sessionId/export**
- Export session data as CSV or JSON
- Query params: `format` ('json' | 'csv')

**GET /api/data/pitches**
- Query pitches with filtering
- Query params: `sessionId`, `minHeight`, `maxHeight`, `minQuality`, `limit`, `offset`

### Analytics

**GET /api/analytics/sessions/:sessionId/summary**
- Get statistical summary for a session

**GET /api/analytics/sessions/:sessionId/distribution**
- Get height distribution histogram
- Query params: `bins` (number of histogram bins)

**GET /api/analytics/compare**
- Compare multiple sessions
- Query params: `sessions` (comma-separated IDs)

**GET /api/analytics/trends**
- Get performance trends over time
- Query params: `dateFrom`, `dateTo`, `metric`

**POST /api/analytics/query**
- Execute custom analytics query
- Body: `{ query, params }`

### Session Management

**POST /api/session**
- Create new session
- Body: `{ name, date, pitcherName?, location?, notes? }`

**PUT /api/session/:sessionId**
- Update session
- Body: session fields to update

**DELETE /api/session/:sessionId**
- Delete session and all pitches

**POST /api/session/:sessionId/pitches**
- Add single pitch to session
- Body: `{ height, uncertainty, qualityScore, ballPosition, calibrationId?, metadata? }`

**POST /api/session/:sessionId/pitches/batch**
- Add multiple pitches at once
- Body: `{ pitches: [...] }`

### Configuration

**GET /api/config**
- Get current app configuration

**PUT /api/config/tracking**
- Update tracking settings
- Body: tracking config updates

**GET /api/config/calibration**
- Get calibration settings

**POST /api/config/reset**
- Reset configuration to defaults

---

## Authentication

Currently, the MCP server does not require authentication. For production use, implement one of:

- **API Keys**: Add `X-API-Key` header validation
- **JWT Tokens**: OAuth 2.0 / JWT authentication
- **mTLS**: Mutual TLS for service-to-service

Example middleware to add:

```typescript
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.use('/api', apiKeyAuth);
```

---

## Rate Limiting

Built-in rate limiting:
- **100 requests per 15 minutes** per IP address
- Configurable via environment variables

Override:

```typescript
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
});
```

---

## Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes in ms
RATE_LIMIT_MAX=100

# Database (future)
DATABASE_PATH=./data/tracker.db

# Authentication (when implemented)
API_KEY=your-secret-api-key
JWT_SECRET=your-jwt-secret
```

---

## Logging

Winston logger with multiple transports:

- **Console**: Colorized output for development
- **File**: `logs/error.log` for errors
- **File**: `logs/combined.log` for all logs

Log levels: `error`, `warn`, `info`, `debug`

---

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Query parameter validation
- **Error Handling**: Safe error messages (no stack traces in production)

---

## Example Agent Integration

### Python Example

```python
import requests

BASE_URL = "http://localhost:3000/api"

# Get all sessions
response = requests.get(f"{BASE_URL}/data/sessions")
sessions = response.json()

# Get session summary
session_id = sessions['sessions'][0]['id']
summary = requests.get(f"{BASE_URL}/analytics/sessions/{session_id}/summary").json()

print(f"Average height: {summary['statistics']['avgHeight']}")

# Export to CSV
csv_data = requests.get(
    f"{BASE_URL}/data/sessions/{session_id}/export",
    params={'format': 'csv'}
).text

with open('session.csv', 'w') as f:
    f.write(csv_data)
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function getSessionStats(sessionId) {
  const response = await axios.get(`${BASE_URL}/analytics/sessions/${sessionId}/summary`);
  return response.data;
}

async function createSession(name, date, pitcherName) {
  const response = await axios.post(`${BASE_URL}/session`, {
    name,
    date,
    pitcherName,
  });
  return response.data;
}

// Usage
const session = await createSession('Practice', '2025-10-23', 'John Doe');
const stats = await getSessionStats(session.id);
console.log(stats);
```

### cURL Examples

```bash
# Health check
curl http://localhost:3000/api/health

# Get sessions
curl "http://localhost:3000/api/data/sessions?limit=10"

# Get session summary
curl http://localhost:3000/api/analytics/sessions/SESSION_ID/summary

# Create session
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"name":"Practice","date":"2025-10-23","pitcherName":"John Doe"}'

# Export CSV
curl "http://localhost:3000/api/data/sessions/SESSION_ID/export?format=csv" \
  -o session.csv
```

---

## Integration with Mobile App

The MCP server can be integrated with the mobile app's database in several ways:

### Option 1: Shared Database (Recommended for Local Development)

```typescript
// In routes/data.ts
import { getAllSessions } from '../../apps/mobile/src/services/database/sessionService';

router.get('/sessions', async (req, res) => {
  const sessions = await getAllSessions();
  res.json({ sessions });
});
```

### Option 2: REST API (Mobile App Exposes API)

Mobile app runs a local Express server that MCP server calls.

### Option 3: File-Based Sync

MCP server reads/writes to SQLite database file directly.

### Option 4: Cloud Backend (Production)

Both mobile app and MCP server connect to shared cloud database (Firebase, Supabase, etc.).

---

## Testing

### Manual Testing

```bash
# Start server
pnpm run dev

# Test in another terminal
curl http://localhost:3000/api/health
```

### Automated Testing (Future)

```typescript
// tests/health.test.ts
import request from 'supertest';
import app from '../src/index';

describe('Health Endpoint', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});
```

---

## Deployment

### Local Development

```bash
pnpm run dev
```

### Docker (Future)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment

Deploy to:
- **AWS Lambda** (serverless)
- **Google Cloud Run** (containers)
- **Heroku** (platform)
- **DigitalOcean App Platform**
- **Fly.io** (edge)

---

## Monitoring

### Health Check

Set up monitoring to ping `/api/health/ping` every minute.

### Metrics to Track

- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate
- Memory usage
- CPU usage

### Alerting

Alert on:
- Server downtime (health check fails)
- High error rate (>1%)
- High response time (>1s p95)
- High memory usage (>80%)

---

## Roadmap

### Phase 5.1: Enhanced Integration
- Direct database integration
- Real-time updates via WebSockets
- Authentication system

### Phase 5.2: Advanced Analytics
- Machine learning predictions
- Anomaly detection
- Personalized recommendations

### Phase 5.3: Extensibility
- Plugin system
- Webhook support
- GraphQL API

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License - see LICENSE file

---

## Support

- **Documentation**: `/docs/MCP_API.md`
- **Issues**: GitHub Issues
- **Email**: support@pitchheighttracker.com

---

*Last modified by: Claude Code on October 23, 2025*
