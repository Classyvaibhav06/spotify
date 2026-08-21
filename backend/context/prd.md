# Product Requirements Document (PRD)

## 1. Product Overview & Vision
**YouTube Music API & Web Platform** provides a modern, fast, and unrestricted music streaming and search ecosystem. By combining a reverse-engineered InnerTube backend with a high-fidelity Spotify-style frontend, the platform enables free, unmetered music discovery and playback for developers and end users alike.

---

## 2. Core User Personas & Use Cases

### Persona A: The End User (Music Listener)
- **Use Case**: Searches for songs, artists, or albums and expects instant, relevant music search results.
- **Needs**: High-fidelity album art, responsive playback controls, queue management, volume adjustments, and continuous background audio without interruptions.

### Persona B: The Third-Party Developer (API Consumer)
- **Use Case**: Integrates music search and metadata retrieval into external Discord bots, mobile apps, or web applications.
- **Needs**: Interactive Swagger/OpenAPI documentation (`/docs`), predictable JSON response contracts, and zero API key/quota friction.

---

## 3. Functional Requirements

### 3.1. Music Search & Discovery
- **FR-01**: System MUST accept natural language queries (artist, song title, album name).
- **FR-02**: System MUST filter search results strictly to music tracks using InnerTube protobuf filters.
- **FR-03**: System MUST return structured metadata: `video_id`, `title`, `author`, `duration`, `duration_seconds`, `thumbnail`, and `view_count`.
- **FR-04**: System MUST support pagination via continuation tokens for infinite scroll loading.

### 3.2. Playback & Streaming
- **FR-05**: System MUST play audio seamlessly for any valid YouTube video ID.
- **FR-06**: Player MUST support play, pause, seek, volume adjust, mute, shuffle, and repeat modes.
- **FR-07**: System MUST support automated queue progression (next track on song end).

### 3.3. Performance, Caching & Rate Limiting
- **FR-08**: System MUST cache search responses for 30 minutes to reduce outbound traffic and latency.
- **FR-09**: System MUST enforce a token bucket rate limit (10 req/s, 20 burst per IP) with HTTP 429 status and `Retry-After` headers on violation.
- **FR-10**: Cache MUST automatically fall back to an in-memory dictionary if Redis is unreachable.

### 3.4. Developer Experience & Documentation
- **FR-11**: System MUST generate live interactive Swagger UI (`/docs`) and ReDoc (`/redoc`).
- **FR-12**: System MUST expose standard OpenAPI 3.1 schema at `/openapi.json`.

---

## 4. Non-Functional Requirements

| Metric | Target Requirement |
|---|---|
| **Search Response Latency (Cached)** | < 15ms |
| **Search Response Latency (Uncached)**| < 600ms |
| **Uptime & Availability** | 99.9% |
| **Error Handling** | Clean JSON error objects (`{"error": "...", "detail": "..."}`) |
| **Browser Compatibility** | Chrome, Edge, Firefox, Safari, Mobile Web |

---

## 5. API Specification & Data Contracts

### Endpoint 1: Search Tracks
- **Route**: `GET /api/search`
- **Query Params**:
  - `q` (string, required): Search query.
  - `limit` (integer, default 20, max 50): Number of results.
  - `continuation` (string, optional): Pagination token.
- **Response Schema**:
  ```json
  {
    "videos": [
      {
        "video_id": "string",
        "title": "string",
        "author": "string",
        "duration": "string",
        "duration_seconds": 0,
        "thumbnail": "string",
        "view_count": "string"
      }
    ],
    "continuation_token": "string | null",
    "estimated_results": 0
  }
  ```

### Endpoint 2: Video Details
- **Route**: `GET /api/video/{video_id}`
- **Response Schema**:
  ```json
  {
    "video_info": { ... },
    "audio_streams": [ ... ]
  }
  ```

### Endpoint 3: Health Check
- **Route**: `GET /health`
- **Response Schema**:
  ```json
  {
    "status": "healthy",
    "service": "youtube-music-api",
    "cache_connected": false
  }
  ```

---

## 6. Success Metrics
1. **Zero Quota Exhaustion**: 100% of music searches handled without Google Cloud API key limits.
2. **Sub-second Response Time**: Average search query turnaround under 500ms.
3. **Playback Reliability**: 100% successful stream initiation for all searchable tracks.
