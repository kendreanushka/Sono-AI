from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image


MODEL_PATH = Path(__file__).parent.parent / "ml" / "model" / "breast_ultrasound_model.keras"

IMAGE_SIZE = (224, 224)

CLASS_NAMES = [
    "benign",
    "malignant",
    "normal"
]


model = tf.keras.models.load_model(MODEL_PATH)


def predict_image(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(IMAGE_SIZE)

    image_array = np.array(image)
    image_array = np.expand_dims(image_array, axis=0)

    predictions = model.predict(image_array, verbose=0)

    predicted_index = np.argmax(predictions[0])
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(predictions[0][predicted_index])

    return {
        "prediction": predicted_class,
        "confidence": round(confidence * 100, 2)
    }