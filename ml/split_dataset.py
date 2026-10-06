from pathlib import Path
import random
import shutil

# Original BUSI dataset
DATASET_DIR = Path("ml/dataset/Dataset_BUSI_with_GT")

# Where our split dataset will be created
SPLIT_DIR = Path("ml/dataset/split")

CLASSES = ["benign", "malignant", "normal"]

# Reproducible random split
random.seed(42)

TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15


for class_name in CLASSES:

    class_dir = DATASET_DIR / class_name

    # Only use original ultrasound images
    # Ignore files containing "_mask"
    original_images = [
        file for file in class_dir.glob("*.png")
        if "_mask" not in file.stem
    ]

    # Shuffle images randomly
    random.shuffle(original_images)

    total = len(original_images)

    train_end = int(total * TRAIN_RATIO)
    validation_end = train_end + int(total * VALIDATION_RATIO)

    train_images = original_images[:train_end]
    validation_images = original_images[train_end:validation_end]
    test_images = original_images[validation_end:]

    splits = {
        "train": train_images,
        "validation": validation_images,
        "test": test_images
    }

    print(f"\n{class_name.upper()}")
    print(f"Total: {total}")

    for split_name, images in splits.items():

        destination = SPLIT_DIR / split_name / class_name
        destination.mkdir(parents=True, exist_ok=True)

        for image in images:
            shutil.copy2(image, destination / image.name)

        print(f"{split_name.capitalize()}: {len(images)}")

print("\nDataset split completed successfully.")