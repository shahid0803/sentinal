from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="SENTINEL AI", version="0.1.0")


class Incident(BaseModel):
    id: str = "analysis-input"
    description: str = Field(min_length=1)


class AnalyzeRequest(BaseModel):
    incident: Incident
    existing_incidents: list[Incident] = []


@app.get("/health")
def health():
    return {"status": "ok", "service": "sentinel-ai", "mode": "deterministic"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    text = request.incident.description.lower()
    critical_terms = ("life", "trapped", "fire", "unconscious", "weapon")
    high_terms = ("injury", "accident", "threat", "smoke")
    severity = "critical" if any(term in text for term in critical_terms) else "high" if any(term in text for term in high_terms) else "moderate"
    duplicate = any(item.description.strip().lower() == request.incident.description.strip().lower() for item in request.existing_incidents)
    return {
        "classification": "emergency" if severity in ("critical", "high") else "incident",
        "severity": severity,
        "confidence": 0.9 if severity == "critical" else 0.78,
        "similarity": 1.0 if duplicate else 0.0,
        "duplicate": duplicate,
        "cluster": {"id": "critical-response" if severity == "critical" else "general-response", "incidentCount": 1 + int(duplicate)},
        "recommendedAction": "Escalate to operations immediately." if severity == "critical" else "Queue for operations review.",
    }
