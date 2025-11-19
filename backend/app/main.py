# backend/app/main.py
import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
from typing import Dict
from app.upload import router as upload_router


# import your processing function
from app.run_pose_on_video import process_video   # make sure python path includes project root or adjust

app = FastAPI()
app.include_router(upload_router, prefix="/api")

# Allow CORS from frontend (adjust origin in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # add your front-end origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = Path(__file__).resolve().parents[2]  # points to repo root
UPLOAD_DIR = BASE / "data" / "raw_videos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/api/upload")
async def upload(video: UploadFile = File(...)):
    # Save uploaded file
    session_id = str(uuid.uuid4())
    filename = f"{session_id}_{video.filename}"
    dst = UPLOAD_DIR / filename
    try:
        with dst.open("wb") as f:
            content = await video.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # Call processing (this is sync; for long videos you may offload to background tasks)
    try:
        result = process_video(str(dst), outdir=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    # Return a minimal contract expected by frontend
    return {
        "session_id": session_id,
        "report": result.get("report"),
        "overlay": result.get("overlay")
    }

@app.post("/api/chat")
async def chat(payload: Dict):
    # very simple rule-based reply for now
    session_id = payload.get("session_id")
    message = payload.get("message", "")
    # You will later plug in LLM or RAG here.
    reply = f"Echo (dev): received '{message[:200]}' for session {session_id}"
    return {"reply": reply}
