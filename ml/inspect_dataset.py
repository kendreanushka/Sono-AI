from pathlib import Path

DATASET_DIR = Path("ml/dataset/Dataset_BUSI_with_GT")

classes = ["benign", "malignant", "normal"]

for class_name in classes:
    class_dir = DATASET_DIR / class_name

    all_pngs = list(class_dir.glob("*.png"))
    mask_files = [
        file for file in all_pngs
        if "_mask" in file.stem
    ]
    original_images = [
        file for file in all_pngs
        if "_mask" not in file.stem
    ]

    print(f"\n{class_name.upper()}")
    print(f"Total PNG files: {len(all_pngs)}")
    print(f"Mask files: {len(mask_files)}")
    print(f"Original ultrasound images: {len(original_images)}")

print("\nDataset inspection complete.")