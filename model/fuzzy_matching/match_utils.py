from rapidfuzz import process, fuzz
import csv
import os

# Load medicine names from CSV
# def load_medicine_names():
#     file_path = os.path.join(os.path.dirname(__file__), "dataset1.csv")
#     medicines = []
#     with open(file_path, 'r', encoding='utf-8') as f:
#         reader = csv.reader(f)
#         for row in reader:
#             medicines.append(row[0].strip().lower())  # Store in lowercase
#     return medicines

# medicine_dataset = load_medicine_names()

# # Get the best match using fuzzy logic
# def get_best_match(ocr_output, threshold=65):
#     """
#     Returns the best matching medicine name from the dataset.
#     """
#     ocr_output_lower = ocr_output.lower()
#     best_match = process.extractOne(ocr_output_lower, medicine_dataset, scorer=fuzz.token_sort_ratio)
    
#     if best_match and best_match[1] >= threshold:
#         return best_match[0]
#     return None

from rapidfuzz import process, fuzz
import csv
import os

# Load medicine names f
def load_medicine_names():
    file_path = os.path.join(os.path.dirname(__file__), "final_cleaned_medicines.csv")
    medicines = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            medicines.append(row[0].strip().lower())  # Store in lowerca
    return medicines

medicine_dataset = load_medicine_names()

# Get the best match using multiple fuzzy matching alo
def get_best_match(ocr_output, threshold=55):
    """
    Returns the best matching medicine name using fuzzy matching.
    """
    ocr_output_lower = ocr_output.lower().strip()

    if not ocr_output_lower:
        print("OCR output is empty, skipping fuzzy matching.")
        return None

    best_match = process.extractOne(ocr_output_lower, medicine_dataset, scorer=fuzz.token_set_ratio)

    if best_match:
        print(f"Fuzzy Match: {ocr_output} > {best_match[0]} (Score: {best_match[1]})")

    return best_match[0] if best_match and best_match[1] >= threshold else None
 
