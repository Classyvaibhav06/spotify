"""
YouTube InnerTube Client - Core Implementation
"""
import asyncio
import json
import random
import re
import time
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, AsyncGenerator
from urllib.parse import urlencode, parse_qs, unquote
import aiohttp
import logging

logger = logging.getLogger(__name__)


@dataclass
class VideoInfo:
    video_id: str
    title: str
    author: str
    duration: str
    duration_seconds: int = 0
    thumbnail: str = ""
    view_count: str = ""


@dataclass
class AudioStream:
    url: str
    mime_type: str
    bitrate: int
    quality: str
    codec: str
    container: str
    itag: int
    content_length: int = 0


@dataclass
class SearchResult:
    videos: List[VideoInfo]
    continuation_token: Optional[str] = None
    estimated_results: int = 0


CLIENT_CONFIGS = {
    "WEB": {
        "clientName": "WEB",
        "clientVersion": "2.20240101.01.00",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "platform": "DESKTOP",
    },
    "ANDROID": {
        "clientName": "ANDROID",
        "clientVersion": "18.45.37",
        "user_agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "platform": "MOBILE",
    },
    "IOS": {
        "clientName": "IOS",
        "clientVersion": "18.45.37",
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "platform": "MOBILE",
    },
}


class InnerTubeClient:
    BASE_URL = "https://www.youtube.com"
    SEARCH_ENDPOINT = "/youtubei/v1/search"
    
    def __init__(
        self,
        initial_client: str = "WEB",
        request_delay: float = 1.5,
        max_retries: int = 5,
        base_backoff: float = 1.0,
        session: Optional[aiohttp.ClientSession] = None,
    ):
        self.current_client = initial_client
        self.request_delay = request_delay
        self.max_retries = max_retries
        self.base_backoff = base_backoff
        self._session = session
        self._last_request_time = 0
        self._request_count = 0
        
    @property
    def client_config(self) -> Dict[str, Any]:
        return CLIENT_CONFIGS[self.current_client]
    
    @property
    def session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session
    
    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
    
    def _build_context(self) -> Dict[str, Any]:
        config = self.client_config
        return {
            "client": {
                "clientName": config["clientName"],
                "clientVersion": config["clientVersion"],
                "platform": config["platform"],
                "userAgent": config["user_agent"],
                "deviceMake": "",
                "deviceModel": "",
                "visitorData": self._generate_visitor_id(),
            },
            "user": {"lockedSafetyMode": False},
            "request": {"useSsl": True, "internalExperimentFlags": []},
        }
    
    def _generate_visitor_id(self) -> str:
        return "".join(random.choices("0123456789ABCDEF", k=32))
    
    async def _rate_limit(self):
        elapsed = time.time() - self._last_request_time
        if elapsed < self.request_delay:
            await asyncio.sleep(self.request_delay - elapsed)
        self._last_request_time = time.time()
        self._request_count += 1
        if self._request_count % 20 == 0:
            self._rotate_client()
    
    def _rotate_client(self):
        clients = list(CLIENT_CONFIGS.keys())
        clients.remove(self.current_client)
        self.current_client = random.choice(clients)
        logger.info(f"Rotated client to: {self.current_client}")
    
    async def _make_request(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        params: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        await self._rate_limit()
        
        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": self.client_config["user_agent"],
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/",
        }
        
        if params:
            url += "?" + urlencode(params)
        
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                async with self.session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    
                    elif response.status == 429:
                        backoff = self.base_backoff * (2 ** attempt) + random.uniform(0, 1)
                        logger.warning(f"Rate limited (429), backing off {backoff:.2f}s (attempt {attempt + 1}/{self.max_retries})")
                        await asyncio.sleep(backoff)
                        self._rotate_client()
                        continue
                    
                    elif 500 <= response.status < 600:
                        backoff = self.base_backoff * (2 ** attempt) + random.uniform(0, 1)
                        logger.warning(f"Server error ({response.status}), backing off {backoff:.2f}s (attempt {attempt + 1}/{self.max_retries})")
                        await asyncio.sleep(backoff)
                        continue
                    
                    else:
                        text = await response.text()
                        raise Exception(f"HTTP {response.status}: {text[:500]}")
                        
            except aiohttp.ClientError as e:
                last_exception = e
                backoff = self.base_backoff * (2 ** attempt) + random.uniform(0, 1)
                logger.warning(f"Network error: {e}, backing off {backoff:.2f}s (attempt {attempt + 1}/{self.max_retries})")
                await asyncio.sleep(backoff)
                continue
        
        raise Exception(f"Max retries exceeded. Last error: {last_exception}")
    
    def _parse_duration(self, duration_text: str) -> int:
        parts = duration_text.split(":")
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        return 0
    
    def _extract_videos_from_response(self, response: Dict[str, Any]) -> List[VideoInfo]:
        videos = []
        try:
            contents = response.get("contents", {})
            section_list = contents.get("twoColumnSearchResultsRenderer", {}).get("primaryContents", {})
            section_list = section_list.get("sectionListRenderer", {}).get("contents", [])
            
            for section in section_list:
                item_section = section.get("itemSectionRenderer", {})
                items = item_section.get("contents", [])
                
                for item in items:
                    video_renderer = item.get("videoRenderer", {})
                    if not video_renderer:
                        continue
                    
                    video_id = video_renderer.get("videoId", "")
                    if not video_id:
                        continue
                    
                    title_runs = video_renderer.get("title", {}).get("runs", [])
                    title = "".join(run.get("text", "") for run in title_runs)
                    
                    author_runs = video_renderer.get("ownerText", {}).get("runs", [])
                    author = "".join(run.get("text", "") for run in author_runs)
                    
                    duration_text = video_renderer.get("lengthText", {}).get("simpleText", "0:00")
                    duration_seconds = self._parse_duration(duration_text)
                    
                    thumbnails = video_renderer.get("thumbnail", {}).get("thumbnails", [])
                    thumbnail = thumbnails[-1].get("url", "") if thumbnails else ""
                    
                    view_count = video_renderer.get("viewCountText", {}).get("simpleText", "")
                    
                    videos.append(VideoInfo(
                        video_id=video_id,
                        title=title,
                        author=author,
                        duration=duration_text,
                        duration_seconds=duration_seconds,
                        thumbnail=thumbnail,
                        view_count=view_count,
                    ))
        except Exception as e:
            logger.error(f"Error parsing video renderers: {e}")
        return videos
    
    def _extract_continuation_token(self, response: Dict[str, Any]) -> Optional[str]:
        try:
            contents = response.get("contents", {})
            section_list = contents.get("twoColumnSearchResultsRenderer", {}).get("primaryContents", {})
            section_list = section_list.get("sectionListRenderer", {}).get("contents", [])
            
            for section in section_list:
                continuation = section.get("continuationItemRenderer", {})
                if continuation:
                    return continuation.get("continuationEndpoint", {}).get("continuationCommand", {}).get("token")
        except Exception:
            pass
        return None
    
    async def search(
        self,
        query: str,
        filter: str = "EgWKAQIIAWoKEAUQBRDIAQ==",
        max_results: int = 20,
    ) -> SearchResult:
        context = self._build_context()
        payload = {
            "context": context,
            "query": query,
            "params": filter,
        }
        
        response = await self._make_request(self.SEARCH_ENDPOINT, payload)
        
        videos = self._extract_videos_from_response(response)
        continuation = self._extract_continuation_token(response)
        
        return SearchResult(
            videos=videos[:max_results],
            continuation_token=continuation,
        )
    
    async def search_continuation(self, token: str) -> SearchResult:
        context = self._build_context()
        payload = {"context": context, "continuation": token}
        
        response = await self._make_request(self.SEARCH_ENDPOINT, payload)
        
        videos = self._extract_videos_from_response(response)
        continuation = self._extract_continuation_token(response)
        
        return SearchResult(videos=videos, continuation_token=continuation)
    
    async def _extract_player_response_from_watch_page(self, video_id: str) -> Optional[Dict[str, Any]]:
        watch_url = f"{self.BASE_URL}/watch?v={video_id}"
        headers = {"User-Agent": self.client_config["user_agent"]}
        
        try:
            async with self.session.get(watch_url, headers=headers) as response:
                if response.status != 200:
                    logger.warning(f"Watch page returned {response.status}")
                    return None
                html = await response.text()
        except Exception as e:
            logger.error(f"Failed to fetch watch page: {e}")
            return None
        
        pattern = r'ytInitialPlayerResponse\s*=\s*({.+?});'
        match = re.search(pattern, html, re.DOTALL)
        
        if not match:
            logger.warning("ytInitialPlayerResponse not found in watch page")
            return None
        
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse ytInitialPlayerResponse: {e}")
            return None
    
    def _parse_audio_streams(self, player_response: Dict[str, Any]) -> List[AudioStream]:
        streams = []
        try:
            streaming_data = player_response.get("streamingData", {})
            
            for fmt in streaming_data.get("adaptiveFormats", []):
                mime_type = fmt.get("mimeType", "")
                if not mime_type.startswith("audio/"):
                    continue
                
                url = fmt.get("url", "")
                if not url:
                    cipher = fmt.get("signatureCipher", "")
                    if cipher:
                        url = self._decrypt_signature(cipher)
                
                if url:
                    itag = fmt.get("itag", 0)
                    bitrate = fmt.get("bitrate", 0)
                    quality = fmt.get("quality", "")
                    codecs = fmt.get("codecs", "")
                    content_length = fmt.get("contentLength", 0)
                    if isinstance(content_length, str):
                        content_length = int(content_length) if content_length.isdigit() else 0
                    
                    container = "mp4" if "mp4" in mime_type else "webm"
                    
                    streams.append(AudioStream(
                        url=url,
                        mime_type=mime_type,
                        bitrate=bitrate,
                        quality=quality,
                        codec=codecs,
                        container=container,
                        itag=itag,
                        content_length=content_length,
                    ))
            
            for fmt in streaming_data.get("formats", []):
                mime_type = fmt.get("mimeType", "")
                is_audio = mime_type.startswith("audio/")
                is_video_with_audio = mime_type.startswith("video/") and "audio" in mime_type
                
                if not (is_audio or is_video_with_audio):
                    continue
                
                url = fmt.get("url", "")
                if not url:
                    cipher = fmt.get("signatureCipher", "")
                    if cipher:
                        url = self._decrypt_signature(cipher)
                
                if url:
                    itag = fmt.get("itag", 0)
                    bitrate = fmt.get("bitrate", 0)
                    quality = fmt.get("quality", "")
                    codecs = fmt.get("codecs", "")
                    content_length = fmt.get("contentLength", 0)
                    if isinstance(content_length, str):
                        content_length = int(content_length) if content_length.isdigit() else 0
                    
                    container = "mp4" if "mp4" in mime_type else "webm"
                    
                    streams.append(AudioStream(
                        url=url,
                        mime_type=mime_type,
                        bitrate=bitrate,
                        quality=quality,
                        codec=codecs,
                        container=container,
                        itag=itag,
                        content_length=content_length,
                    ))
                    
        except Exception as e:
            logger.error(f"Error parsing audio streams: {e}")
        
        streams.sort(key=lambda s: s.bitrate, reverse=True)
        return streams
    
    def _decrypt_signature(self, cipher: str) -> str:
        params = parse_qs(cipher)
        url = params.get("url", [""])[0]
        signature = params.get("s", [""])[0]
        sp = params.get("sp", ["signature"])[0]
        
        if signature and url:
            url = unquote(url)
            return f"{url}&{sp}={signature}"
        return url
    
    async def get_audio_streams(self, video_id: str) -> List[AudioStream]:
        player_response = await self._extract_player_response_from_watch_page(video_id)
        
        if not player_response:
            logger.warning(f"Could not extract player response for {video_id}")
            return []
        
        playability = player_response.get("playabilityStatus", {})
        if playability.get("status") != "OK":
            logger.warning(f"Video not playable: {playability.get('reason')}")
            return []
        
        return self._parse_audio_streams(player_response)
    
    async def get_best_audio_url(self, video_id: str, prefer_webm: bool = True) -> Optional[str]:
        streams = await self.get_audio_streams(video_id)
        
        if not streams:
            return None
        
        if prefer_webm:
            webm_streams = [s for s in streams if s.container == "webm"]
            if webm_streams:
                return webm_streams[0].url
        
        return streams[0].url
    
    async def get_video_info_and_audio(self, video_id: str) -> tuple[Optional[VideoInfo], List[AudioStream]]:
        player_response = await self._extract_player_response_from_watch_page(video_id)
        
        if not player_response:
            return None, []
        
        playability = player_response.get("playabilityStatus", {})
        if playability.get("status") != "OK":
            logger.warning(f"Video not playable: {playability.get('reason')}")
            return None, []
        
        video_details = player_response.get("videoDetails", {})
        video_info = VideoInfo(
            video_id=video_id,
            title=video_details.get("title", ""),
            author=video_details.get("author", ""),
            duration=f"{int(video_details.get('lengthSeconds', 0)) // 60}:{int(video_details.get('lengthSeconds', 0)) % 60:02d}",
            duration_seconds=int(video_details.get("lengthSeconds", 0)),
            view_count=video_details.get("viewCount", ""),
        )
        
        audio_streams = self._parse_audio_streams(player_response)
        
        return video_info, audio_streams


async def search_music(query: str, max_results: int = 10) -> List[tuple[VideoInfo, Optional[str]]]:
    client = InnerTubeClient()
    try:
        results = []
        async for video, audio_url in client.search_and_get_audio(query, max_results):
            results.append((video, audio_url))
        return results
    finally:
        await client.close()


async def main():
    client = InnerTubeClient(initial_client="WEB")
    try:
        results = await client.search("lofi hip hop", max_results=5)
        print(f"Found {len(results.videos)} videos")
        for i, video in enumerate(results.videos, 1):
            print(f"{i}. {video.title} - {video.author} ({video.duration})")
            audio_url = await client.get_best_audio_url(video.video_id)
            print(f"   Audio: {audio_url[:80] if audio_url else 'Not available'}...")
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())