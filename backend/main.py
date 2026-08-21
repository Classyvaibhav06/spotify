"""
FastAPI application for YouTube InnerTube Music API
"""
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from models import (
    SearchResult,
    StreamResponse,
    VideoDetailResponse,
    ErrorResponse,
    VideoInfo,
)
from innerTube_client import InnerTubeClient
from cache import cache, CacheKeys
from rate_limiter import rate_limiter

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ytmusic.api")

# Shared InnerTube client instance
yt_client: Optional[InnerTubeClient] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global yt_client
    logger.info("Initializing YouTube Music API backend...")
    
    # Connect cache
    await cache.connect()
    
    # Start rate limiter cleanup
    await rate_limiter.start_cleanup()
    
    # Initialize InnerTube client
    yt_client = InnerTubeClient(
        initial_client="WEB",
        request_delay=1.0,
        max_retries=3,
    )
    
    logger.info("YouTube Music API initialized and ready.")
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down YouTube Music API backend...")
    if yt_client:
        await yt_client.close()
    await rate_limiter.stop_cleanup()
    await cache.close()
    logger.info("Shutdown complete.")


app = FastAPI(
    title="YouTube Music InnerTube API",
    description="High-performance, async API for YouTube Music search and stream extraction.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers or connection info."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


async def check_rate_limit_dep(request: Request, endpoint: str):
    """Check rate limit for client IP."""
    client_ip = get_client_ip(request)
    allowed, wait_time = await rate_limiter.check_rate_limit(client_ip, endpoint)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please retry after {wait_time:.1f}s",
            headers={"Retry-After": str(int(wait_time) + 1)},
        )


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "youtube-music-api",
        "cache_connected": cache._client is not None,
    }


@app.get("/", tags=["System"])
async def root():
    """Root redirect / overview."""
    return {
        "name": "YouTube Music API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get(
    "/api/search",
    response_model=SearchResult,
    responses={429: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Music"],
)
async def search_tracks(
    request: Request,
    q: str = Query(..., description="Search query string (song, artist, album)", min_length=1),
    limit: int = Query(20, description="Max results count", ge=1, le=50),
    continuation: Optional[str] = Query(None, description="Continuation token for pagination"),
):
    """
    Search for music tracks on YouTube Music with caching and rate limiting.
    """
    await check_rate_limit_dep(request, "search")
    
    if not yt_client:
        raise HTTPException(status_code=500, detail="InnerTube client not initialized")
    
    cache_id = f"{q}:{limit}:{continuation or 'start'}"
    cached = await cache.get(CacheKeys.SEARCH, cache_id)
    if cached:
        return SearchResult(**cached)
    
    try:
        if continuation:
            result = await yt_client.search_continuation(continuation)
        else:
            result = await yt_client.search(query=q, max_results=limit)
            
        result_dict = {
            "videos": [v.__dict__ for v in result.videos],
            "continuation_token": result.continuation_token,
            "estimated_results": result.estimated_results,
        }
        
        # Cache for 30 minutes
        await cache.set(CacheKeys.SEARCH, cache_id, result_dict, ttl=1800)
        return SearchResult(**result_dict)
    except Exception as e:
        logger.error(f"Search failed for '{q}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get(
    "/api/video/{video_id}",
    response_model=VideoDetailResponse,
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
    tags=["Music"],
)
async def get_video_details(
    request: Request,
    video_id: str,
):
    """
    Get detailed video metadata and available audio formats.
    """
    await check_rate_limit_dep(request, "video")
    
    if not yt_client:
        raise HTTPException(status_code=500, detail="InnerTube client not initialized")
    
    cached = await cache.get(CacheKeys.VIDEO_DETAIL, video_id)
    if cached:
        return VideoDetailResponse(**cached)
    
    try:
        video_info, audio_streams = await yt_client.get_video_info_and_audio(video_id)
        if not video_info:
            # Fallback basic info
            video_info = VideoInfo(
                video_id=video_id,
                title="Unknown Track",
                author="Unknown Artist",
                duration="0:00",
                duration_seconds=0,
            )
        
        response_data = {
            "video_info": video_info.__dict__,
            "audio_streams": [s.__dict__ for s in audio_streams],
        }
        
        await cache.set(CacheKeys.VIDEO_DETAIL, video_id, response_data, ttl=3600)
        return VideoDetailResponse(**response_data)
    except Exception as e:
        logger.error(f"Failed to fetch details for {video_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Video detail extraction error: {str(e)}")


@app.get(
    "/api/stream/{video_id}",
    response_model=StreamResponse,
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
    tags=["Music"],
)
async def get_stream(
    request: Request,
    video_id: str,
):
    """
    Get playable stream URLs and audio formats for a specific video ID.
    """
    await check_rate_limit_dep(request, "stream")
    
    if not yt_client:
        raise HTTPException(status_code=500, detail="InnerTube client not initialized")
    
    cached = await cache.get(CacheKeys.STREAM, video_id)
    if cached:
        return StreamResponse(**cached)
    
    try:
        audio_streams = await yt_client.get_audio_streams(video_id)
        best_url = await yt_client.get_best_audio_url(video_id)
        
        # If no raw CDN URL is resolved due to YouTube signature, fallback to embed streaming reference
        if not best_url:
            best_url = f"https://www.youtube.com/watch?v={video_id}"
            
        stream_data = {
            "video_id": video_id,
            "best_audio_url": best_url,
            "formats": [s.__dict__ for s in audio_streams],
            "expires_in": "~6 hours",
        }
        
        await cache.set(CacheKeys.STREAM, video_id, stream_data, ttl=1800)
        return StreamResponse(**stream_data)
    except Exception as e:
        logger.error(f"Failed to get stream for {video_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Stream extraction failed: {str(e)}")


@app.get("/api/trending", tags=["Music"])
async def get_trending(request: Request):
    """
    Get curated trending music tracks for instant discovery.
    """
    await check_rate_limit_dep(request, "trending")
    return await search_tracks(request=request, q="Top Hits 2026", limit=16)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
