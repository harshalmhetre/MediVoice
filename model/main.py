from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from paddle_ocr.ocr_utils import process_image_with_ocr
from tts.tts_utils import text_to_speech
import os
from uuid import uuid4

app = FastAPI()
UPLOAD_DIR = "uploads/"
AUDIO_DIR = "audio/"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)


# @app.post("/scan-prescription/")
# async def scan_prescription(image: UploadFile):
#     try:
#         file_path = f"{UPLOAD_DIR}{uuid4().hex}_{image.filename}"
#         with open(file_path, "wb") as buffer:
#             buffer.write(await image.read())
#         # Extract text using PaddleOCR
#         extracted_text = process_image_with_ocr(file_path)
#         if not extracted_text:
#             return JSONResponse(content={"error": "No text detected."}, status_code=400)
#         return {"extracted_text": extracted_text}
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/scan-prescription/")
async def scan_prescription(image: UploadFile):
    try:
        file_path = f"{UPLOAD_DIR}{uuid4().hex}_{image.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())

        # Extract corrected medicine names
        matched_medicines = process_image_with_ocr(file_path)

        # Remove None values before sending respons
        matched_medicines = [med for med in matched_medicines if med]

        if not matched_medicines:
            return JSONResponse(content={"error": "No valid medicine names detected."}, status_code=400)

        return {"medicines": matched_medicines}
    
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


class TextRequest(BaseModel):
    text: str
@app.post("/hear-medicines/")
async def hear_medicines(request: TextRequest):
    try:
        audio_file_path = f"{AUDIO_DIR}{uuid4().hex}_output.mp3"
        text_to_speech(request.text, audio_file_path)  # Convert text to speech
        return FileResponse(audio_file_path)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# @app.post("/hear-medicines/")
# async def hear_medicines(text: str = Form(...)):
#     try:
#         audio_file_path = f"{AUDIO_DIR}{uuid4().hex}_output.mp3"
#         text_to_speech(text, audio_file_path)
#         return FileResponse(audio_file_path)
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
