import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_straming_availability(tmdb_id: int, region: str = "PK"):
    api_key = os.getenv("WATCHMODE_KEY")
    map_url = f"https://api.watchmode.com/v1/mapping/{tmdb_id}/tmdb?apiKey={api_key}"
    mapping = requests.get(map_url).json()
    
    if "source_id" not in mapping:
        return []
    
    sources_url = f"https://api.watchmode.com/v1/title/{mapping['source_id']}/sources/?apiKey={api_key}&regions={region}"
    sources = requests.get(sources_url).json()
    
    return list(set([s['name'] for s in sources if s['type'] == 'sub']))
    