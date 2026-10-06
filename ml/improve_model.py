from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from sklearn.utils.class_weight import compute_class_weight


# -----------------------------
# Paths
# -----------------------------

TRAIN_DIR = Path("ml/dataset/split/train")
VALIDATION_DIR = Path("ml/dataset/split/validation")

MODEL_DIR = Path("ml/model")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "breast_ultrasound_model_improved.keras"


# -----------------------------
# Configuration
# -----------------------------

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

CLASS_NAMES = ["benign", "malignant", "normal"]

INITIAL_EPOCHS = 5
FINE_TUNE_EPOCHS = 5


# -----------------------------
# Load datasets
# -----------------------------

train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    labels="inferred",
    label_mode="int",
    class_names=CLASS_NAMES,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VALIDATION_DIR,
    labels="inferred",
    label_mode="int",
    class_names=CLASS_NAMES,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# -----------------------------
# Calculate class weights
# -----------------------------

class_counts = np.array([305, 147, 93])

total_samples = class_counts.sum()

class_weights = {
    class_index: total_samples / (len(CLASS_NAMES) * count)
    for class_index, count in enumerate(class_counts)
}

print("\nClass weights:")
for index, class_name in enumerate(CLASS_NAMES):
    print(f"{class_name}: {class_weights[index]:.2f}")


# -----------------------------
# Data loading optimization
# -----------------------------

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)


# -----------------------------
# Data augmentation
# -----------------------------

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.05),
    layers.RandomZoom(0.10),
])


# -----------------------------
# Load MobileNetV2
# -----------------------------

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Initially freeze everything
base_model.trainable = False


# -----------------------------
# Build model
# -----------------------------

inputs = keras.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dense(128, activation="relu")(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    3,
    activation="softmax"
)(x)

model = keras.Model(inputs, outputs)


# -----------------------------
# Phase 1: Train classifier
# -----------------------------

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

print("\n========== PHASE 1 ==========")
print("Training classification layers...")

model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=INITIAL_EPOCHS,
    class_weight=class_weights
)


# -----------------------------
# Phase 2: Fine-tuning
# -----------------------------

print("\n========== PHASE 2 ==========")
print("Fine-tuning MobileNetV2...")

base_model.trainable = True

# Freeze the early layers.
# Only the later layers will be fine-tuned.

for layer in base_model.layers[:-30]:
    layer.trainable = False


# Recompile with a very small learning rate
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.00001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=FINE_TUNE_EPOCHS,
    class_weight=class_weights
)


# -----------------------------
# Save improved model
# -----------------------------

model.save(MODEL_PATH)

print("\nImproved model training completed.")
print(f"Model saved to: {MODEL_PATH}")