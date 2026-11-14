import time
import json
import urllib.request
from typing import Dict, Any, List, Optional
from datetime import datetime, date

class BaseConnector:
    def __init__(self, name: str, source_type: str):
        self.name = name
        self.source_type = source_type
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MumbaiTechCareerRadar/2.0",
            "Accept": "application/json"
        }

    def fetch_url_json(self, url: str, timeout: int = 8) -> Optional[Any]:
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = resp.read().decode("utf-8", errors="replace")
                    return json.loads(data)
        except Exception as e:
            # Silently capture or log failure
            return None
        return None

    def normalize_job(self, raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    def fetch_jobs(self) -> List[Dict[str, Any]]:
        raise NotImplementedError

