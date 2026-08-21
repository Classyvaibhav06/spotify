"""
Redis caching layer for YouTube Music API
"""
import json
import os
import time
from typing import Optional, Any, Dict
from datetime import timedelta
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)


class CacheManager:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._client: Optional[redis.Redis] = None
        self.default_ttl = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default
        self._memory_cache: Dict[str, tuple[Any, float]] = {}
    
    async def connect(self):
        if self._client is None:
            try:
                client = redis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                )
                await client.ping()
                self._client = client
                logger.info("Connected to Redis successfully")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}). Falling back to in-memory caching.")
                self._client = None
    
    async def close(self):
        if self._client:
            await self._client.close()
            self._client = None
    
    def _key(self, prefix: str, identifier: str) -> str:
        return f"ytmusic:{prefix}:{identifier}"
    
    async def get(self, prefix: str, identifier: str) -> Optional[Any]:
        key = self._key(prefix, identifier)
        if self._client:
            try:
                data = await self._client.get(key)
                if data:
                    return json.loads(data)
            except Exception as e:
                logger.warning(f"Redis get error: {e}")
        
        # In-memory fallback
        if key in self._memory_cache:
            val, expire_time = self._memory_cache[key]
            if time.time() < expire_time:
                return val
            else:
                del self._memory_cache[key]
        return None
    
    async def set(
        self,
        prefix: str,
        identifier: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> bool:
        key = self._key(prefix, identifier)
        expire = ttl or self.default_ttl
        if self._client:
            try:
                await self._client.setex(
                    key,
                    expire,
                    json.dumps(value, default=str),
                )
                return True
            except Exception as e:
                logger.warning(f"Cache set error: {e}")
        
        # In-memory fallback
        self._memory_cache[key] = (value, time.time() + expire)
        return True
    
    async def delete(self, prefix: str, identifier: str) -> bool:
        key = self._key(prefix, identifier)
        deleted = False
        if self._client:
            try:
                await self._client.delete(key)
                deleted = True
            except Exception as e:
                logger.warning(f"Cache delete error: {e}")
        if key in self._memory_cache:
            del self._memory_cache[key]
            deleted = True
        return deleted
    
    async def clear_prefix(self, prefix: str) -> int:
        count = 0
        if self._client:
            try:
                pattern = self._key(prefix, "*")
                keys = []
                async for key in self._client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    count = await self._client.delete(*keys)
            except Exception as e:
                logger.warning(f"Cache clear error: {e}")
        
        # Memory clear
        p = f"ytmusic:{prefix}:"
        mem_keys = [k for k in self._memory_cache if k.startswith(p)]
        for k in mem_keys:
            del self._memory_cache[k]
        return count + len(mem_keys)


# Global cache instance
cache = CacheManager()


# Cache key prefixes
class CacheKeys:
    SEARCH = "search"
    STREAM = "stream"
    VIDEO_DETAIL = "video"