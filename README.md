# Live Video Chat Platform

A real-time video chat platform built with Node.js, Express, and WebRTC.

## Features

- 🎥 Video chat with random partners
- 💬 Real-time text messaging
- 🔄 Skip to next partner
- 📱 Mobile-responsive design
- ⚡ HTTP-based signaling (no WebSocket dependency)

## Local Development

```bash
npm install
npm start
```

Open http://localhost:3000 to use the video chat.

## Railway Deployment

This application is configured for easy deployment on Railway.com:

### Method 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the Node.js app and deploy it

### Method 2: Deploy with Railway CLI

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

### Environment Variables

No environment variables are required for basic functionality. The app uses:

- `PORT`: Automatically set by Railway
- `NODE_ENV`: Automatically set to "production" on Railway

### Health Check

The app includes a health check endpoint at `/health` which Railway can use to monitor the application.

## Project Structure

```
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── railway.json       # Railway configuration
├── public/            # Static files
│   ├── index.html     # Frontend application
│   └── favicon.*      # Icons
└── api/
    └── chat.js        # Chat API handler
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/chat` - API status
- `POST /api/chat` - Chat operations (join, findPartner, signal, etc.)

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + WebRTC
- **Deployment**: Railway.com
- **Real-time Communication**: HTTP polling (Vercel-friendly)
