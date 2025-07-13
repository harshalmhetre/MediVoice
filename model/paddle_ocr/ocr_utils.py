
import cv2
import numpy as np
from ultralytics import YOLO
from paddleocr import PaddleOCR
from fuzzy_matching.match_utils import get_best_match

# Load YOLO mo
try:
    yolo_model = YOLO("./runs/detect/train2/weights/best2.pt")
    print("YOLO Model Loaded Successfully!")
except Exception as e:
    print(f"Error loading YOLO model: {e}")

# Initialize PaddleOCR
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='en',
    rec_model_dir="C:/Study/Techathon/paddleocr/PaddleOCR/output/v3_en_mobile/latest",
    #drop_score=0.3,
    rec_image_shape="3, 48, 160",
    #rec_algorithm='SVTR_LCNet',
    #use_gpu=False, # Change to True if using GPu
    det_db_box_thresh=0.2,  # More sensitive to faint t
    det_db_thresh=0.2,  # Detects weak text regions
    use_space_char=True
)


def preprocess_image(image):
    """Preprocesses cropped image for OCR."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    processed_image = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                            cv2.THRESH_BINARY, 11, 2)
    return processed_image

def process_image_with_ocr(image_path):
    
    #Detects only 'medicine' bounding boxes using YOLO, crops them, preprocesses, and runs OCR.
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"$$Error: Image not found at {image_path}")

    print(f"**Image loaded: {image_path} ({image.shape[1]}x{image.shape[0]})")

    # Run YOLO inference
    results = yolo_model(image)
    print(f"**Detected {len(results[0].boxes)} objects")



    extracted_texts = []

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            class_id = int(box.cls[0])
            class_name = r.names[class_id]

            # Skip "pres" box and process only "medicine" boxes
            if "medicine" not in class_name.lower():
                print(f"Skipping '{class_name}' box")
                continue

            print(f"**Processing '{class_name}' box at ({x1}, {y1}, {x2}, {y2})")

            cropped_region = image[y1:y2, x1:x2]

            # Preprocess the cropped image for better OCR
            processed_image = preprocess_image(cropped_region)

            # Save temporary processed image
            temp_path = "temp_medicine_crop.png"
            success = cv2.imwrite(temp_path, processed_image)
            if not success:
                raise ValueError("Failed to save cropped image")

            print(f"**Cropped medicine image saved: {temp_path}")

            # Run OCR
            ocr_result = ocr.ocr(temp_path, cls=True)

            # Store extracted text
            if not ocr_result or not any(res for res in ocr_result):
                print(f"❌ No text detected in {temp_path}, skipping...")
                continue

            extracted_texts += [line[1][0] for res in ocr_result if res for line in res]

    # Apply fuzzy matching
    matched_medicines = [get_best_match(text) if text else None for text in extracted_texts]

    # Draw bounding boxes on the image
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            class_id = int(box.cls[0])
            class_name = r.names[class_id]
            conf = box.conf[0].item()

            # Draw rectangle
            color = (0, 255, 0) if "medicine" in class_name.lower() else (0, 0, 255)
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

            # Put label text
            label = f"{class_name} ({conf:.2f})"
            cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # Save and show the image with box
    output_path = "output_with_boxes.jpg"
    cv2.imwrite(output_path, image)
    print(f"Image with YOLO boxes saved: {output_path}")

    return matched_medicines



