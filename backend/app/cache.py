import hashlib
import json
from typing import Any, Optional
from datetime import datetime, timedelta

class AgentCache:
    def __init__(self, ttl_hours: int = 24):
        self.cache = {}
        self.ttl_hours = ttl_hours
    
    def _generate_key(self, agent_name: str, input_data: Any) -> str:
        data_str = json.dumps(input_data, sort_keys=True, default=str)
        hash_obj = hashlib.md5(data_str.encode())
        return f"{agent_name}:{hash_obj.hexdigest()[:16]}"
    
    def get(self, agent_name: str, input_data: Any) -> Optional[Any]:
        key = self._generate_key(agent_name, input_data)
        
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        
        if datetime.now() > entry["expires_at"]:
            del self.cache[key]
            return None
        
        return entry["result"]
    
    def set(self, agent_name: str, input_data: Any, result: Any) -> None:
        key = self._generate_key(agent_name, input_data)
        
        expires_at = datetime.now() + timedelta(hours=self.ttl_hours)
        
        self.cache[key] = {
            "result": result,
            "created_at": datetime.now(),
            "expires_at": expires_at
        }
    
    def reset(self) -> None:
        self.cache.clear()
    
    def get_stats(self) -> dict:
        total_entries = len(self.cache)
        expired_entries = 0
        
        for entry in self.cache.values():
            if datetime.now() > entry["expires_at"]:
                expired_entries += 1
        
        return {
            "total_entries": total_entries,
            "active_entries": total_entries - expired_entries,
            "expired_entries": expired_entries
        }

agent_cache_instance = AgentCache()
