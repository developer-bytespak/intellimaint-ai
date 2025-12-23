# Backend Architecture Guide

## Overview

Your application uses **TWO separate backends**:

1. **Gateway (Render)** - Main REST API
2. **Services (Railway)** - WebSocket & AI Services

## Backend Responsibilities

### Gateway (Render)

**URL**: `https://your-gateway.onrender.com`
**Environment Variable**: `NEXT_PUBLIC_NEST_URL`

**Endpoints**:

- `/api/v1/auth/*` - Authentication
- `/api/v1/user/*` - User management
- `/api/v1/chat/*` - Chat sessions & messages
- `/api/v1/repository/*` - Document repository
- `/api/v1/billing/*` - Billing & subscriptions

### Services (Railway)

**URL**: `https://intellimaint-ai-backend-production.up.railway.app`
**Environment Variables**:

- `NEXT_PUBLIC_API_URL` - HTTP endpoints
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket streaming

**Endpoints**:

- `/api/v1/stream` - WebSocket audio streaming
- `/api/v1/asr/synthesize` - Audio synthesis
- `/api/v1/vision/*` - Vision AI
- `/api/v1/rag/*` - RAG (Retrieval Augmented Generation)

## Frontend Configuration

### Environment Variables

```env
# Gateway on Render (for chat, auth, users, billing)
NEXT_PUBLIC_NEST_URL=https://your-gateway.onrender.com

# Services on Railway (for audio, vision, RAG)
NEXT_PUBLIC_API_URL=https://intellimaint-ai-backend-production.up.railway.app

# WebSocket on Railway (for real-time audio streaming)
NEXT_PUBLIC_WEBSOCKET_URL=wss://intellimaint-ai-backend-production.up.railway.app/api/v1/stream
```

### Code Usage

```typescript
// ✅ CORRECT Usage

// For chat, auth, users (uses Gateway)
import baseURL, { API_BASE } from "@/lib/api/axios";
// This uses NEXT_PUBLIC_NEST_URL

// For audio/ASR services (uses Railway)
const API_BASE_URL = CONFIG.API_URL || "http://localhost:8000";
// This uses NEXT_PUBLIC_API_URL

// For WebSocket streaming (uses Railway)
const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL);
```

## Common Mistakes

### ❌ Wrong

```typescript
// DON'T use Railway URL for chat
const chatUrl = `${CONFIG.API_URL}/chat/messages/stream`;
```

### ✅ Correct

```typescript
// USE Gateway URL for chat
const chatUrl = `${API_BASE}/chat/messages/stream`;
```

## Request Flow

```
User Action
    ↓
┌─────────────────────────────────────┐
│ Frontend (Vercel)                   │
│ https://intellimaint-ai.vercel.app  │
└─────────────────────────────────────┘
    ↓                    ↓
    ↓                    └──────────────────────┐
    ↓                                           ↓
┌──────────────────────┐           ┌───────────────────────────┐
│ Gateway (Render)     │           │ Services (Railway)        │
│ - Chat               │           │ - WebSocket Streaming     │
│ - Auth               │           │ - Audio (ASR/TTS)         │
│ - Users              │           │ - Vision AI               │
│ - Billing            │           │ - RAG                     │
└──────────────────────┘           └───────────────────────────┘
```

## Deployment Checklist

### Frontend (Vercel)

- [ ] Set `NEXT_PUBLIC_NEST_URL` to Gateway URL
- [ ] Set `NEXT_PUBLIC_API_URL` to Railway URL
- [ ] Set `NEXT_PUBLIC_WEBSOCKET_URL` to Railway WebSocket URL
- [ ] Redeploy after changing environment variables

### Gateway (Render)

- [ ] Configure CORS with frontend URL
- [ ] Set `FRONTEND_URL` environment variable
- [ ] Deploy latest code

### Services (Railway)

- [ ] Configure CORS with frontend URL
- [ ] Set `ALLOWED_ORIGINS` environment variable
- [ ] Deploy latest code

## Troubleshooting

### 404 Errors

- **Check**: Are you using the correct backend for the endpoint?
- **Chat endpoints** → Use Gateway (`NEXT_PUBLIC_NEST_URL`)
- **Audio/Vision** → Use Services (`NEXT_PUBLIC_API_URL`)

### CORS Errors

- **Check**: Both backends must allow your frontend URL
- Gateway: `origin: ['https://intellimaint-ai.vercel.app', ...]`
- Services: `allowed_origins: ['https://intellimaint-ai.vercel.app', ...]`

### Connection Refused

- **Check**: Environment variables are set in Vercel dashboard
- Local `.env` doesn't affect deployed app!
