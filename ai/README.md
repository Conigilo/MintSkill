# AI Services - Skill Badge Platform

## Overview
AI/ML services for skill analysis and badge recommendations.

## Tech Stack
- **Language**: Python 3.10+
- **Framework**: FastAPI / Flask (TBD)
- **ML Libraries**: 
  - scikit-learn
  - TensorFlow / PyTorch (TBD)
  - transformers (for NLP)
- **Database**: Firebase Firestore (via Admin SDK)

## Folder Structure
```
ai/
├── services/
│   ├── skill-analyzer/      # Skill analysis service
│   └── badge-recommender/   # Badge recommendation service
├── models/                  # Trained ML models
├── utils/                   # Utilities
└── requirements.txt         # Python dependencies
```

## Getting Started

### Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Development Server
```bash
python -m uvicorn main:app --reload
```

## Services

### 1. Skill Analyzer
Analyzes user skills and proficiency levels.

**Endpoint**: `POST /api/ai/analyze-skills`

**Input**:
```json
{
  "userId": "string",
  "skills": ["Python", "JavaScript", "React"]
}
```

**Output**:
```json
{
  "analysis": {
    "proficiency": "intermediate",
    "strengths": ["Frontend Development"],
    "gaps": ["Backend Development"]
  }
}
```

### 2. Badge Recommender
Recommends badges based on user skills and goals.

**Endpoint**: `POST /api/ai/recommend-badges`

**Input**:
```json
{
  "userId": "string",
  "currentSkills": ["Python", "JavaScript"],
  "goals": ["Full Stack Development"]
}
```

**Output**:
```json
{
  "recommendations": [
    {
      "badgeId": "badge-123",
      "name": "React Expert",
      "confidence": 0.85,
      "reason": "Complements your JavaScript skills"
    }
  ]
}
```
