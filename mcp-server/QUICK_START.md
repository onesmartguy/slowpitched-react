# MCP Server - Quick Start Guide

## Your Setup Information

**Your Mac's Local IP**: `172.16.22.44`

This means:
- Server will run at: `http://localhost:3000` (on your Mac)
- iPhone can connect at: `http://172.16.22.44:3000` (on same WiFi)
- WebSocket at: `ws://172.16.22.44:3000`

## Start the MCP Server (Development Mode)

### Option 1: Using the Startup Script (Recommended)

```bash
cd /Users/eddie.flores/source/slowpitched-react/mcp-server
./start-local.sh
```

### Option 2: Manual Start

```bash
cd /Users/eddie.flores/source/slowpitched-react/mcp-server

# First time only
cp .env.example .env
pnpm install

# Start server
pnpm run dev
```

## What You'll See

When the server starts successfully:

```
🚀 MCP Server running at http://localhost:3000
📊 Database: Connected
📡 WebSocket: Active
```

## Test the Server

Open a new terminal and test:

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":...}
```

## From Your iPhone

Once your iPhone is on the **same WiFi network** as your Mac:

1. Open Safari on iPhone
2. Go to: `http://172.16.22.44:3000/api/health`
3. You should see the health check response

## Available Endpoints

Once running, you have access to **31 API endpoints**:

### Quick Test Endpoints

```bash
# Server info
curl http://172.16.22.44:3000/

# Health check
curl http://172.16.22.44:3000/api/health

# List sessions
curl http://172.16.22.44:3000/api/data/sessions

# Analytics summary
curl http://172.16.22.44:3000/api/analytics/summary
```

### All Available Routes

**Health & Info**:
- `GET /` - Server information
- `GET /api/health` - Health check

**Data Management** (6 endpoints):
- `GET /api/data/sessions` - List all sessions
- `GET /api/data/sessions/:id` - Get session details
- `GET /api/data/pitches` - List pitches
- `GET /api/data/pitches/:id` - Get pitch details
- `GET /api/data/export/:sessionId` - Export to CSV
- `DELETE /api/data/sessions/:id` - Delete session

**Analytics** (5 endpoints):
- `GET /api/analytics/summary` - Overall summary
- `GET /api/analytics/sessions/:id/summary` - Session summary
- `GET /api/analytics/trends` - Performance trends
- `GET /api/analytics/compare` - Compare sessions
- `GET /api/analytics/leaderboard` - Top performers

**Session Management** (5 endpoints):
- `POST /api/session` - Create session
- `GET /api/session/:id` - Get session
- `PUT /api/session/:id` - Update session
- `DELETE /api/session/:id` - Delete session
- `POST /api/session/:id/complete` - Complete session

**Configuration** (3 endpoints):
- `GET /api/config` - Get all config
- `GET /api/config/:key` - Get specific config
- `PUT /api/config/:key` - Update config

**ML Analytics** (6 endpoints):
- `POST /api/ml/predict` - Predict future performance
- `POST /api/ml/anomalies` - Detect anomalies
- `POST /api/ml/trend` - Classify trend
- `POST /api/ml/consistency` - Analyze consistency
- `POST /api/ml/forecast` - Forecast performance
- `GET /api/ml/insights/:sessionId` - Get insights

**WebSocket Events**:
- Connect to: `ws://172.16.22.44:3000`
- Events: `connected`, `pitch_logged`, `session_updated`

## Connecting Your Mobile App

If you want the mobile app to connect to this server, you'll need to configure the API base URL.

### Option 1: Environment Variable (Recommended for Development)

Create `apps/mobile/.env`:

```bash
API_BASE_URL=http://172.16.22.44:3000
WS_URL=ws://172.16.22.44:3000
```

### Option 2: Hardcode for Testing

Create `apps/mobile/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  baseURL: 'http://172.16.22.44:3000',
  wsURL: 'ws://172.16.22.44:3000',
  timeout: 10000,
};
```

Then in your API service files, import and use:

```typescript
import { API_CONFIG } from './config/api';

const response = await fetch(`${API_CONFIG.baseURL}/api/data/sessions`);
```

## Troubleshooting

### "Cannot GET /"
✅ Server is running! Try: `http://localhost:3000/api/health`

### "Connection refused"
- Check server is running: `ps aux | grep node`
- Restart server: `pnpm run dev`

### "Cannot connect from iPhone"
- Verify same WiFi network
- Check IP address: `ifconfig | grep "inet "`
- Try in Safari first: `http://172.16.22.44:3000/api/health`
- Check Mac firewall settings

### "EADDRINUSE: Port 3000 already in use"
Kill existing process:
```bash
lsof -ti:3000 | xargs kill -9
pnpm run dev
```

## Logs

Server logs are written to:
- `mcp-server/logs/combined.log` - All logs
- `mcp-server/logs/error.log` - Errors only
- Console output - Real-time logs

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Development Tips

### Auto-Restart on Code Changes

The `pnpm run dev` command uses `ts-node`, which doesn't auto-restart.

For auto-restart, install nodemon:

```bash
pnpm add -D nodemon

# Add to package.json scripts:
"dev:watch": "nodemon --exec ts-node src/index.ts"

# Run:
pnpm run dev:watch
```

### Testing WebSocket Connection

Create a simple HTML file to test WebSocket:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>WebSocket Test</h1>
  <div id="status">Connecting...</div>
  <div id="messages"></div>

  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <script>
    const socket = io('http://172.16.22.44:3000');

    socket.on('connected', (data) => {
      document.getElementById('status').textContent = 'Connected!';
      console.log('Connected:', data);
    });

    socket.on('pitch_logged', (data) => {
      const div = document.getElementById('messages');
      div.innerHTML += '<p>New pitch: ' + JSON.stringify(data) + '</p>';
    });
  </script>
</body>
</html>
```

## Next Steps

1. ✅ Start the server: `./start-local.sh` or `pnpm run dev`
2. ✅ Test health endpoint: `curl http://localhost:3000/api/health`
3. ✅ Test from iPhone: `http://172.16.22.44:3000/api/health`
4. ✅ Configure mobile app with server URL
5. ✅ Rebuild mobile app with EAS
6. ✅ Test complete system!

## Your Network Info

- **Mac IP**: 172.16.22.44
- **Server Port**: 3000
- **API Base**: http://172.16.22.44:3000
- **WebSocket**: ws://172.16.22.44:3000

Make sure your iPhone is on the **same WiFi network** as your Mac!

## Questions?

- Full deployment guide: `DEPLOYMENT.md`
- Project documentation: `../PROJECT_COMPLETE.md`
- Mobile app deployment: `../DEPLOY_TO_PHONE.md`

---

**Ready to start?**

```bash
cd /Users/eddie.flores/source/slowpitched-react/mcp-server
pnpm run dev
```

---

Last modified by: Claude Code Agent on 2025-10-23
