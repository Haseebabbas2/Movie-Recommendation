import os
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_KEY = os.getenv("TMDB_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Country codes for major regions
COUNTRY_CODES = {
    "US": "United States",
    "GB": "United Kingdom", 
    "CA": "Canada",
    "IN": "India",
    "PK": "Pakistan",
    "AU": "Australia",
    "DE": "Germany",
    "FR": "France",
    "JP": "Japan",
    "BR": "Brazil"
}

# Provider IDs (TMDB)
NETFLIX_ID = 8
PRIME_VIDEO_ID = 9


def search_multi(query: str):
    """Search for movies and TV shows by name."""
    url = f"{TMDB_BASE_URL}/search/multi"
    params = {
        "api_key": TMDB_KEY,
        "query": query,
        "language": "en-US"
    }
    response = requests.get(url, params=params)
    
    results = []
    if response.status_code == 200:
        items = response.json().get("results", [])
        for item in items[:5]:  # Top 5 results
            media_type = item.get("media_type")
            if media_type in ["movie", "tv"]:
                results.append({
                    "id": item["id"],
                    "title": item.get("title") or item.get("name"),
                    "overview": item.get("overview", ""),
                    "media_type": media_type,
                    "release_date": item.get("release_date") or item.get("first_air_date", ""),
                    "poster_path": item.get("poster_path", "")
                })
    return results


def get_watch_providers_for_type(item_id: int, media_type: str):
    """Get streaming availability for a movie or TV show across all regions."""
    url = f"{TMDB_BASE_URL}/{media_type}/{item_id}/watch/providers"
    params = {"api_key": TMDB_KEY}
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        return {}
    
    results = response.json().get("results", {})
    availability = {}
    
    for country_code, country_name in COUNTRY_CODES.items():
        country_data = results.get(country_code, {})
        flatrate = country_data.get("flatrate", [])  # Subscription streaming
        
        providers = []
        for provider in flatrate:
            provider_id = provider.get("provider_id")
            provider_name = provider.get("provider_name")
            if provider_id == NETFLIX_ID:
                providers.append("Netflix")
            elif provider_id == PRIME_VIDEO_ID:
                providers.append("Prime Video")
        
        if providers:
            availability[country_code] = {
                "country": country_name,
                "platforms": providers
            }
    
    return availability


def get_tv_seasons(tv_id: int):
    """Get season information for a TV show."""
    url = f"{TMDB_BASE_URL}/tv/{tv_id}"
    params = {"api_key": TMDB_KEY}
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        return []
    
    data = response.json()
    seasons = []
    for season in data.get("seasons", []):
        if season.get("season_number", 0) > 0:  # Skip specials (season 0)
            seasons.append({
                "season_number": season["season_number"],
                "name": season.get("name", f"Season {season['season_number']}"),
                "episode_count": season.get("episode_count", 0),
                "air_date": season.get("air_date", "")
            })
    return seasons


def get_content_availability(query: str):
    """Search for movies/TV shows and return streaming availability by region."""
    items = search_multi(query)
    
    if not items:
        return {"error": "No movies or TV shows found"}
    
    results = []
    for item in items:
        availability = get_watch_providers_for_type(item["id"], item["media_type"])
        
        result = {
            "id": item["id"],
            "title": item["title"],
            "overview": item["overview"],
            "type": "TV Show" if item["media_type"] == "tv" else "Movie",
            "media_type": item["media_type"],
            "release_date": item["release_date"],
            "availability": availability,
            "available_regions": list(availability.keys()),
            "total_regions": len(availability)
        }
        
        # Add season info for TV shows
        if item["media_type"] == "tv":
            result["seasons"] = get_tv_seasons(item["id"])
            result["total_seasons"] = len(result["seasons"])
        
        results.append(result)
    
    return {"results": results, "total_found": len(results)}


def get_streaming_availability(movie_id: int, region: str = "US"):
    """Get streaming availability for a specific movie in a specific region."""
    url = f"{TMDB_BASE_URL}/movie/{movie_id}/watch/providers"
    params = {"api_key": TMDB_KEY}
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        return []
    
    results = response.json().get("results", {})
    region_data = results.get(region, {})
    flatrate = region_data.get("flatrate", [])
    
    platforms = []
    for provider in flatrate:
        provider_id = provider.get("provider_id")
        if provider_id == NETFLIX_ID:
            platforms.append("Netflix")
        elif provider_id == PRIME_VIDEO_ID:
            platforms.append("Prime Video")
    
    return platforms


# Legacy function for backward compatibility
def get_movie_availability(movie_name: str):
    """Search movie by name and return streaming availability by region."""
    return get_content_availability(movie_name)
