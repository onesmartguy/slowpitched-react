# MCP Server Deployment Guide

## Current Status

The MCP server code is complete with all 31 API endpoints and WebSocket support. However, there's an architectural consideration for deployment:

### Architecture Options

**Option 1: Integrated Deployment (Current Design)**
- MCP server imports mobile app's database services directly
- Shares database file with mobile app
- ✅ No data duplication
- ✅ Single source of truth
- ❌ Requires mobile app and server to run on same machine
- ❌ More complex TypeScript configuration

**Option 2: Standalone Deployment (Recommended for Testing)**
- MCP server has its own in-memory or SQLite database
- Mobile app syncs data via API calls
- ✅ Can deploy server anywhere (cloud, local network, etc.)
- ✅ Simpler build process
- ✅ Better for production/testing
- ❌ Requires sync logic

## Quick Start (Local Testing)

For immediate testing on your local network:

### 1. Start the MCP Server Locally

```bash
cd mcp-server
cp .env.example .env
pnpm install
pnpm run dev
```

The server will start at `http://localhost:3000`

### 2. Update Mobile App to Connect

In your mobile app, set the API base URL to your local IP:

```typescript
// apps/mobile/src/config/api.ts
export const API_BASE_URL = 'http://192.168.1.XXX:3000';  // Your Mac's IP
```

### 3. Find Your Local IP

```bash
# On Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# You'll see something like: inet 192.168.1.123
```

### 4. Test from Your Phone

Once your phone is on the same WiFi network:
- The mobile app can connect to `http://192.168.1.XXX:3000`
- WebSocket will connect to `ws://192.168.1.XXX:3000`
- All 31 API endpoints will be available

## Deployment Options

### Option A: Local Development Server

**Best for**: Initial testing, development

```bash
cd mcp-server
./start-local.sh
```

**Access**:
- From Mac: `http://localhost:3000`
- From iPhone on WiFi: `http://YOUR_MAC_IP:3000`

### Option B: Cloud Deployment (Railway)

**Best for**: Sharing with others, permanent testing

1. **Sign up at railway.app** (free tier available)

2. **Deploy**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Deploy
   cd mcp-server
   railway init
   railway up
   ```

3. **Get your URL**: `https://your-app.railway.app`

4. **Update mobile app** to use your Railway URL

### Option C: Heroku Deployment

**Best for**: Traditional deployment

1. **Create Heroku app**:
   ```bash
   heroku create slowpitched-mcp
   ```

2. **Deploy**:
   ```bash
   cd mcp-server
   git init
   git add .
   git commit -m "Deploy MCP server"
   heroku git:remote -a slowpitched-mcp
   git push heroku main
   ```

3. **Your URL**: `https://slowpitched-mcp.herokuapp.com`

### Option D: Render Deployment

**Best for**: Free hosting with auto-deploy

1. **Sign up at render.com**

2. **Create Web Service**:
   - Connect your GitHub repo
   - Select `mcp-server` directory
   - Build command: `pnpm install && pnpm run build`
   - Start command: `pnpm run start`

3. **Auto-deploys** on every git push

## Configuration

### Environment Variables

Create `.env` file in `mcp-server/`:

```bash
# Required
PORT=3000
NODE_ENV=production

# Optional
LOG_LEVEL=info
CORS_ORIGINS=*
RATE_LIMIT_MAX_REQUESTS=100
```

### For Cloud Deployment

Set these environment variables in your hosting platform:

- `PORT`: Usually auto-set by platform
- `NODE_ENV`: `production`
- `LOG_LEVEL`: `info` or `error`
- `CORS_ORIGINS`: Your mobile app's origins (or `*` for testing)

## API Endpoints Available

Once deployed, all 31 endpoints will be available:

### Health & Status
- `GET /` - Server info
- `GET /api/health` - Health check

### Data Management (6 endpoints)
- `GET /api/data/sessions` - List all sessions
- `GET /api/data/sessions/:id` - Get session details
- `GET /api/data/pitches` - List pitches with filters
- `GET /api/data/pitches/:id` - Get pitch details
- `GET /api/data/export/:sessionId` - Export session to CSV
- `DELETE /api/data/sessions/:id` - Delete session

### Analytics (5 endpoints)
- `GET /api/analytics/summary` - Overall summary
- `GET /api/analytics/sessions/:id/summary` - Session summary
- `GET /api/analytics/trends` - Performance trends
- `GET /api/analytics/compare` - Compare sessions
- `GET /api/analytics/leaderboard` - Top performers

### Session Management (5 endpoints)
- `POST /api/session` - Create new session
- `GET /api/session/:id` - Get session
- `PUT /api/session/:id` - Update session
- `DELETE /api/session/:id` - Delete session
- `POST /api/session/:id/complete` - Complete session

### Configuration (3 endpoints)
- `GET /api/config` - Get all config
- `GET /api/config/:key` - Get specific config
- `PUT /api/config/:key` - Update config

### ML Analytics (6 endpoints)
- `POST /api/ml/predict` - Predict future performance
- `POST /api/ml/anomalies` - Detect anomalies
- `POST /api/ml/trend` - Classify trend
- `POST /api/ml/consistency` - Analyze consistency
- `POST /api/ml/forecast` - Forecast performance
- `GET /api/ml/insights/:sessionId` - Get insights

### WebSocket Events
- `connected` - Client connected
- `pitch_logged` - New pitch added
- `session_updated` - Session modified
- `join_session` - Subscribe to session updates

## Testing the Deployment

### 1. Health Check

```bash
curl https://your-server.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T...",
  "uptime": 123.45,
  "database": "connected"
}
```

### 2. Create a Session

```bash
curl -X POST https://your-server.com/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Session",
    "date": "2025-10-23",
    "pitcherName": "Test Pitcher"
  }'
```

### 3. WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('https://your-server.com');

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.emit('join_session', 'session-id');

socket.on('pitch_logged', (data) => {
  console.log('New pitch:', data);
});
```

## Mobile App Integration

### Update API Configuration

```typescript
// apps/mobile/src/config/api.ts
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  wsURL: process.env.WS_URL || 'ws://localhost:3000',
  timeout: 10000,
};
```

### For Local Testing

```typescript
export const API_CONFIG = {
  baseURL: 'http://192.168.1.123:3000',  // Your Mac's IP
  wsURL: 'ws://192.168.1.123:3000',
  timeout: 10000,
};
```

### For Production

```typescript
export const API_CONFIG = {
  baseURL: 'https://your-server.railway.app',
  wsURL: 'wss://your-server.railway.app',
  timeout: 10000,
};
```

## Troubleshooting

### "Cannot connect to server"

- Check that server is running: `curl http://localhost:3000/api/health`
- Verify your local IP: `ifconfig | grep "inet "`
- Ensure phone is on same WiFi network
- Check firewall settings (allow port 3000)

### "CORS error"

Update CORS_ORIGINS in `.env`:
```
CORS_ORIGINS=http://localhost:19000,http://localhost:8081,http://192.168.1.123:8081
```

### "Database not found"

For standalone deployment, the server uses an in-memory database by default.
Data will reset when server restarts (this is fine for testing).

### "WebSocket not connecting"

- Check that WS_URL uses `ws://` (local) or `wss://` (production)
- Verify WebSocket is enabled in hosting platform
- Check browser/app console for connection errors

## Performance Considerations

### Local Network
- Latency: ~1-10ms
- Best for development
- Requires same WiFi network

### Cloud Deployment
- Latency: ~50-200ms depending on location
- Works from anywhere
- Better for sharing/testing

### Recommendations

1. **Start with local deployment** for initial testing
2. **Deploy to cloud** once basic functionality works
3. **Use Railway or Render** for free hosting
4. **Enable HTTPS/WSS** for production

## Next Steps

1. ✅ Start local server: `cd mcp-server && ./start-local.sh`
2. ✅ Find your Mac's IP: `ifconfig | grep "inet "`
3. ✅ Update mobile app with your IP
4. ✅ Build and deploy mobile app to iPhone
5. ✅ Test connection from phone
6. ✅ Deploy to cloud if needed

## Security Notes

For production deployment:

- [ ] Enable authentication/API keys
- [ ] Use HTTPS/WSS only
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Regular backups if using persistent database

---

**Current Server Features**:
- ✅ 31 REST API endpoints
- ✅ WebSocket real-time updates
- ✅ ML analytics (6 algorithms)
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Request logging
- ✅ Error handling
- ✅ Health monitoring

**Ready to deploy!** 🚀

---

Last modified by: Claude Code Agent on 2025-10-23
