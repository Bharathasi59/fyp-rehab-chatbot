# backend/app/api/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid, os, traceback
from app.run_pose_on_video import run_pose   # <-- import the function defined above

router = APIRouter()

@router.post("/upload")
async def upload(video: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    os.makedirs("temp", exist_ok=True)
    save_path = os.path.join("temp", f"{session_id}.mp4")

    try:
        # save uploaded file
        with open(save_path, "wb") as f:
            f.write(await video.read())

        # call your processing function (synchronous)
        report, overlay = run_pose(save_path)

        return {
            "session_id": session_id,
            "report": report,
            "overlay": overlay
        }

    except Exception as e:
        # return a helpful error to frontend & log stacktrace server-side
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
