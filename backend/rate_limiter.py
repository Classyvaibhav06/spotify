"""
Token bucket rate limiter for YouTube Music API
"""
import time
import asyncio
from typing import Dict, Optional
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class TokenBucket:
    def __init__(self, rate: float, burst: int):
        self.rate = rate  # tokens per second
        self.burst = burst  # max tokens
        self.tokens = burst
        self.last_update = time.monotonic()
        self._lock = asyncio.Lock()
    
    async def take(self, tokens: int = 1) -> float:
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self.last_update
            self.tokens = min(self.burst, self.tokens + elapsed * self.rate)
            self.last_update = now
            
            if self.tokens >= tokens:
                self.tokens -= tokens
                return 0.0
            
            # Calculate wait time
            deficit = tokens - self.tokens
            wait_time = deficit / self.rate
            self.tokens = 0
            return wait_time


class RateLimiter:
    def __init__(
        self,
        requests_per_second: float = 10.0,
        burst: int = 20,
        per_ip: bool = True,
    ):
        self.requests_per_second = requests_per_second
        self.burst = burst
        self.per_ip = per_ip
        self.buckets: Dict[str, TokenBucket] = defaultdict(
            lambda: TokenBucket(requests_per_second, burst)
        )
        self._cleanup_task: Optional[asyncio.Task] = None
    
    def _get_key(self, client_ip: str, endpoint: str) -> str:
        if self.per_ip:
            return f"{client_ip}:{endpoint}"
        return f"global:{endpoint}"
    
    async def check_rate_limit(
        self,
        client_ip: str,
        endpoint: str,
        tokens: int = 1,
    ) -> tuple[bool, float]:
        key = self._get_key(client_ip, endpoint)
        bucket = self.buckets[key]
        wait_time = await bucket.take(tokens)
        
        if wait_time > 0:
            return False, wait_time
        return True, 0.0
    
    async def wait_if_needed(self, client_ip: str, endpoint: str, tokens: int = 1):
        allowed, wait_time = await self.check_rate_limit(client_ip, endpoint, tokens)
        if not allowed:
            logger.info(f"Rate limited {client_ip} on {endpoint}, waiting {wait_time:.2f}s")
            await asyncio.sleep(wait_time)
    
    def get_remaining(self, client_ip: str, endpoint: str) -> int:
        key = self._get_key(client_ip, endpoint)
        bucket = self.buckets.get(key)
        if bucket:
            return int(bucket.tokens)
        return self.burst
    
    def reset_client(self, client_ip: str):
        keys_to_remove = [k for k in self.buckets if k.startswith(f"{client_ip}:")]
        for key in keys_to_remove:
            del self.buckets[key]
    
    async def start_cleanup(self, interval: int = 300):
        async def cleanup():
            while True:
                await asyncio.sleep(interval)
                now = time.monotonic()
                to_remove = []
                for key, bucket in self.buckets.items():
                    if now - bucket.last_update > 3600:  # 1 hour inactive
                        to_remove.append(key)
                for key in to_remove:
                    del self.buckets[key]
                if to_remove:
                    logger.debug(f"Cleaned up {len(to_remove)} inactive rate limit buckets")
        
        self._cleanup_task = asyncio.create_task(cleanup())
    
    async def stop_cleanup(self):
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass


# Global rate limiter instance
rate_limiter = RateLimiter(
    requests_per_second=5.0,  # 5 requests/second
    burst=10,  # burst of 10
    per_ip=True,
)