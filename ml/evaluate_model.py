from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix


# -----------------------------
# Paths
# -----------------------------

TEST_DIR = Path("ml/dataset/split/test")
MODEL_PATH = Path("ml/model/breast_ultrasound_model.keras")


# -----------------------------
# Configuration
# -----------------------------

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

CLASS_NAMES = ["benign", "malignant", "normal"]


# -----------------------------
# Load test dataset
# -----------------------------

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    labels="inferred",
    label_mode="int",
    class_names=CLASS_NAMES,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# -----------------------------
# Load trained model
# -----------------------------

model = tf.keras.models.load_model(MODEL_PATH)


# -----------------------------
# Get predictions
# -----------------------------

y_true = []
y_pred = []

for images, labels in test_dataset:

    predictions = model.predict(images, verbose=0)

    predicted_classes = np.argmax(predictions, axis=1)

    y_true.extend(labels.numpy())
    y_pred.extend(predicted_classes)


y_true = np.array(y_true)
y_pred = np.array(y_pred)


# -----------------------------
# Accuracy
# -----------------------------

accuracy = np.mean(y_true == y_pred)

print("\nTest Accuracy:")
print(f"{accuracy * 100:.2f}%")


# -----------------------------
# Classification report
# -----------------------------

print("\nClassification Report:")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=CLASS_NAMES,
        digits=4
    )
)


# -----------------------------
# Confusion matrix
# -----------------------------

print("Confusion Matrix:")

cm = confusion_matrix(y_true, y_pred)

print(cm)

print("\nClass order:")
print(CLASS_NAMES)