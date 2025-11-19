# backend/app/pose_service.py
import cv2
import math
import json
import os

def run_pose(video_path):
    """Simple video reader that returns a basic report + dummy overlay frames.
    Replace keypoint extraction with MediaPipe or MoveNet later.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(video_path)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Cannot open video: " + video_path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = frame_count / fps if fps else 0.0

    frames_out = []
    max_frames = 300  # limit to avoid huge outputs in prototype
    i = 0
    while cap.isOpened() and i < max_frames:
        ok, frame = cap.read()
        if not ok:
            break
        t = i / fps
        h, w = frame.shape[:2]

        # Dummy keypoints: symmetrical points (norm coords 0..1)
        # Replace with real detector output: list of {x,y,score}
        kp = [
            {"x": 0.5, "y": 0.1, "score": 0.9},  # nose/head
            {"x": 0.5, "y": 0.3, "score": 0.9},  # neck
            {"x": 0.4, "y": 0.4, "score": 0.9},  # left shoulder
            {"x": 0.6, "y": 0.4, "score": 0.9},  # right shoulder
            {"x": 0.4, "y": 0.7, "score": 0.9},  # left hip
            {"x": 0.6, "y": 0.7, "score": 0.9},  # right hip
        ]

        frames_out.append({"time": round(t, 3), "keypoints": kp})
        i += 1

    cap.release()

    report = {
        "video_path": video_path,
        "fps": fps,
        "frame_count": frame_count,
        "duration_sec": round(duration, 2),
        "sample_frames_processed": len(frames_out)
    }

    overlay = {"frames": frames_out}

    return report, overlay
