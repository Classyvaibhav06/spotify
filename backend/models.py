from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime


class VideoInfo(BaseModel):
    video_id: str
    title: str
    author: str
    duration: str
    duration_seconds: int = 0
    thumbnail: str = ""
    view_count: str = ""


class AudioStream(BaseModel):
    itag: int
    mime_type: str
    bitrate: int
    container: str
    codec: str
    url: str
    content_length: int = 0


class SearchResult(BaseModel):
    videos: List[VideoInfo]
    continuation_token: Optional[str] = None
    estimated_results: int = 0


class StreamResponse(BaseModel):
    video_id: str
    best_audio_url: str
    formats: List[AudioStream]
    expires_in: str = "~6 hours"


class VideoDetailResponse(BaseModel):
    video_info: VideoInfo
    audio_streams: List[AudioStream]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None