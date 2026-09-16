import json
import logging
from dataclasses import dataclass
from threading import RLock
from time import monotonic
from typing import Any


logger = logging.getLogger(__name__)

PROCESSING_CACHE_PREFIX = "processing"
DEPARTMENTS_CACHE_KEY = "catalog:departments"
FIELDS_CACHE_KEY = "catalog:fields"
OFFICERS_CACHE_KEY = "catalog:officers"


@dataclass(frozen=True, slots=True)
class _CacheEntry:
    value: Any
    expiresAt: float


class InMemoryCache:
    def __init__(self) -> None:
        self._entries: dict[str, _CacheEntry] = {}
        self._lock = RLock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            entry = self._entries.get(key)
            if entry is None:
                logger.debug("CACHE MISS key=%s", key)
                return None
            if entry.expiresAt <= monotonic():
                del self._entries[key]
                logger.debug("CACHE MISS key=%s", key)
                return None
            logger.debug("CACHE HIT key=%s", key)
            return entry.value

    def set(self, key: str, value: Any, ttlSeconds: float) -> None:
        if ttlSeconds <= 0:
            raise ValueError("ttlSeconds phải lớn hơn 0")
        with self._lock:
            currentTime = monotonic()
            expiredKeys = [
                existingKey
                for existingKey, entry in self._entries.items()
                if entry.expiresAt <= currentTime
            ]
            for expiredKey in expiredKeys:
                del self._entries[expiredKey]
            self._entries[key] = _CacheEntry(
                value=value,
                expiresAt=currentTime + ttlSeconds,
            )

    def delete(self, key: str) -> bool:
        with self._lock:
            return self._entries.pop(key, None) is not None

    def clear_prefix(self, prefix: str) -> int:
        with self._lock:
            matchingKeys = [
                key
                for key in self._entries
                if key.startswith(prefix)
            ]
            for key in matchingKeys:
                del self._entries[key]
            return len(matchingKeys)


def buildCacheKey(prefix: str, **parameters: Any) -> str:
    serializedParameters = json.dumps(
        parameters,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )
    return f"{prefix}:{serializedParameters}"


def invalidateProcessingCache() -> int:
    return cache.clear_prefix(f"{PROCESSING_CACHE_PREFIX}:")


cache = InMemoryCache()
