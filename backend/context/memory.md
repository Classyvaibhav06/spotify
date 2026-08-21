# Project Memory & Knowledge Base

## 1. System Status & Ports

| Component | Port | Technology | Process / Command |
|---|---|---|---|
| **FastAPI Backend** | `8000` | Python 3.11+ / FastAPI / Uvicorn | `uvicorn main:app --host 127.0.0.1 --port 8000` |
| **Interactive Docs**| `8000` | Swagger UI / ReDoc | `http://127.0.0.1:8000/docs` |
| **Spotify UI** | `3000` | Next.js 16 (Turbopack) / React 19 | `npm run dev` in `spotify/` |
| **Redis Cache** (Optional)| `6379` | Redis 7 | Local service or Docker container |

---

## 2. Key Architecture Decisions Log (ADRs)

### ADR 01: InnerTube API over YouTube Data API v3
- **Decision**: Reverse engineer YouTube's internal `/youtubei/v1/search` endpoint instead of requiring a Google Cloud Developer API key.
- **Rationale**: YouTube Data API v3 has a restrictive quota of 10,000 units/day (where a single search costs 100 units = 100 searches/day max). InnerTube has zero quota constraints and requires no authentication credentials.

### ADR 02: In-Memory Cache Fallback for Redis
- **Decision**: Implemented an automated in-memory TTL dictionary in [cache.py](file:///c:/Users/vaibhav%20ghoshi/youtube-music-api/backend/cache.py) that activates when Redis is offline.
- **Rationale**: Ensures the backend operates out-of-the-box in local development environments without throwing connection refusal errors.

### ADR 03: IFrame Audio Engine over Server-Side Cipher Deciphering
- **Decision**: Routed music playback through [YouTubeAudioEngine.tsx](file:///c:/Users/vaibhav%20ghoshi/youtube-music-api/spotify/components/Player/YouTubeAudioEngine.tsx) in the browser.
- **Rationale**: YouTube frequently updates JavaScript signature obfuscation (`n`-transform, `signatureCipher`). Attempting to descramble raw CDN stream URLs on the backend is prone to breaking; the IFrame engine delivers 100% playback reliability across all songs and regions.

### ADR 04: UI Migration to Spotify Next.js App
- **Decision**: Replaced the initial lightweight Vite frontend with the comprehensive Spotify Next.js clone in `spotify/`.
- **Rationale**: Provides a complete feature set including custom playlists, search autocompletion, queue management, lyrics viewing, and keyboard shortcuts.

---

## 3. Technical Discoveries & Gotchas

1. **Client Spoofing Structure**:
   - Omitting `visitorData` or `clientVersion` in the context payload causes YouTube to return HTTP `400 Bad Request`.
2. **Music Protobuf Parameter**:
   - The query parameter `"params": "EgWKAQIIAWoKEAUQBRDIAQ=="` is required to eliminate non-music search results (e.g. video podcasts, reviews).
3. **Continuation Token Format**:
   - The token extracted from `continuationItemRenderer` must be passed as `continuation` in the search payload for infinite scroll pagination.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` or `BACKEND_URL` in `spotify/.env.local` dictates the backend destination. When omitted, it defaults to `http://127.0.0.1:8000`.

---

## 4. Environment Variables Reference

### Backend (`backend/.env`)
```env
HOST=0.0.0.0
PORT=8000
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600
RATE_LIMIT_RPS=10.0
RATE_LIMIT_BURST=20
```

### Frontend (`spotify/.env.local`)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-secret-key-here"
DATABASE_URL="your-database-url-here"
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 5. Maintenance & Troubleshooting Runbook

- **Restarting Backend**:
  ```bash
  cd "c:\Users\vaibhav ghoshi\youtube-music-api\backend"
  python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Restarting Frontend**:
  ```bash
  cd "c:\Users\vaibhav ghoshi\youtube-music-api\spotify"
  npm run dev
  ```
- **Checking Backend Health**:
  ```bash
  curl http://127.0.0.1:8000/health
  ```
- **Testing Search Manually**:
  ```bash
  curl "http://127.0.0.1:8000/api/search?q=daft+punk&limit=5"
  ```
