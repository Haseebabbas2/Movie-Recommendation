# 🎬 Movie Concierge

An AI-powered movie recommendation system with real-time Netflix & Prime Video streaming availability checker.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![LangChain](https://img.shields.io/badge/LangChain-RAG-orange.svg)

## ✨ Features

- 🤖 **AI Recommendations** - Get personalized movie suggestions using natural language queries
- 🌍 **Global Availability** - Check Netflix/Prime Video availability across 10+ countries
- 📺 **TV Shows Support** - Search both movies and TV shows with season details
- ⚡ **Semantic Search** - Vector-based movie search using Pinecone
- 🎨 **Modern UI** - Beautiful glassmorphism dark theme design

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python, FastAPI |
| AI/LLM | Google Gemini, LangChain |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) |
| Vector DB | Pinecone |
| Movie Data | TMDB API |
| Frontend | HTML, CSS, JavaScript |

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Haseebabbas2/Movie-Recommendation.git
cd Movie-Recommendation
```

### 2. Create virtual environment
```bash
python3 -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install fastapi uvicorn langchain langchain-google-genai langchain-pinecone langchain-huggingface python-dotenv requests
```

### 4. Set up environment variables
Create a `.env` file with your API keys:
```env
TMDB_KEY=your_tmdb_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=movie-recommendation
GOOGLE_API_KEY=your_google_api_key
```

### 5. Index movies to Pinecone
```bash
python ingestion.py
```

### 6. Run the backend
```bash
uvicorn main:app --reload --port 8001
```

### 7. Open the frontend
Open `frontend/index.html` in your browser or serve it:
```bash
cd frontend && python3 -m http.server 3000
```

## 📁 Project Structure

```
Movie-Recommendation/
├── main.py           # FastAPI backend server
├── chains.py         # LangChain RAG pipeline
├── ingestion.py      # Movie data indexing to Pinecone
├── utils.py          # TMDB API utilities
├── model.py          # Pydantic models
├── frontend/
│   ├── index.html    # Main HTML page
│   ├── styles.css    # Modern glassmorphism styles
│   └── app.js        # Frontend JavaScript
├── .env.example      # Environment variables template
└── README.md
```

## 🌐 Supported Regions

| Flag | Country |
|------|---------|
| 🇺🇸 | United States |
| 🇬🇧 | United Kingdom |
| 🇨🇦 | Canada |
| 🇮🇳 | India |
| 🇵🇰 | Pakistan |
| 🇦🇺 | Australia |
| 🇩🇪 | Germany |
| 🇫🇷 | France |
| 🇯🇵 | Japan |
| 🇧🇷 | Brazil |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recommend` | Get AI movie recommendations |
| POST | `/availability` | Check streaming availability |
| GET | `/countries` | Get supported countries list |

## 🔑 Getting API Keys

- **TMDB**: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- **Pinecone**: [app.pinecone.io](https://app.pinecone.io)
- **Google AI**: [makersuite.google.com](https://makersuite.google.com/app/apikey)

## 📄 License

MIT License

---

Made with ❤️ by [Haseeb Abbas](https://github.com/Haseebabbas2)
