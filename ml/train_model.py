from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2


# -----------------------------
# Paths
# -----------------------------

TRAIN_DIR = Path("ml/dataset/split/train")
VALIDATION_DIR = Path("ml/dataset/split/validation") #These tell the script where our training and validation images are located.

MODEL_DIR = Path("ml/model")            #Our trained model should go inside ml/model.
MODEL_DIR.mkdir(parents=True, exist_ok=True)    #This creates the directory if it doesn't already exist.(exist_ok=True) If the directory already exists, don't give me an error.

MODEL_PATH = MODEL_DIR / "breast_ultrasound_model.keras"  #This is where our trained model will eventually be saved.


# -----------------------------
# Configuration - settings for our training process.
# -----------------------------

IMAGE_SIZE = (224, 224)      #Every image input resized to: 224 × 224 -  used by the model MobileNetV2.
BATCH_SIZE = 16               # 16 images are processed in one batch
NUM_CLASSES = 3                #This value will later determine the number of neurons in our final layer.has 3 outputs
EPOCHS = 8                     # 8 - many times the model goes through the training data.

CLASS_NAMES = ["benign", "malignant", "normal"]     #This explicitly defines our class order(index). index 0 → benign, index 1 → malignant, index 2 → normal. [0.80, 0.15, 0.05]


# -----------------------------
# Load datasets
# -----------------------------

# Model trainig is done. model learns
train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    labels="inferred",
    label_mode="categorical",
    class_names=CLASS_NAMES,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,                   #It means the order of training images is randomized.
    seed=42
)

# model gets evaluated during training
validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VALIDATION_DIR,
    labels="inferred",
    label_mode="categorical",
    class_names=CLASS_NAMES,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False                   #We don't need to randomly shuffle the validation dataset.
)


# -----------------------------
# Improve data loading speed
# -----------------------------
#prepare upcoming batches while the model is working on the current batch.
# I used TensorFlow prefetching with AUTOTUNE to improve the input pipeline efficiency
AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)


# -----------------------------
# Data augmentation
# -----------------------------

# This applies random transformations to training images, as part of the training pipeline.
#This can help reduce overfitting.  

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),           #Some images can be flipped horizontally.
    layers.RandomRotation(0.05),                #Images can be rotated slightly.0.05 represents a relatively small rotation range.
    layers.RandomZoom(0.10),                   #Images can be slightly zoomed in or out.
])


# -----------------------------
# MobileNetV2 base model
# -----------------------------

base_model = MobileNetV2(
    input_shape=(224, 224, 3),        # Input image size: 224×224 pixels with 3 RGB channels
    include_top=False,                # Remove ImageNet's 1000-class classification head. our problem has only 3 class :Benign,Malignant,Normal
    weights="imagenet"              #Load the weights that MobileNetV2 learned from ImageNet.
)

# Freeze pretrained layers - using MobileNetV2 as a feature extractor and training our own classification layers on top.
base_model.trainable = False      # Freeze pretrained weights and use MobileNetV2 as a feature extractor


# -----------------------------
# Build complete model
# -----------------------------

inputs = keras.Input(shape=(224, 224, 3))     #The model receives an image represented as 224 × 224 × 3.

x = data_augmentation(inputs)                  #The input image goes through our augmentation pipeline.

x = tf.keras.applications.mobilenet_v2.preprocess_input(x)     # Preprocess pixels as expected by MobileNetV2

x = base_model(x, training=False)                     # Pass image through frozen MobileNetV2 to extract features. Run the MobileNetV2 layers in non-training mode.

 #converts the 3D feature map (7 × 7 × 1280) for each image into a 1D (1280 values) feature vector
x = layers.GlobalAveragePooling2D()(x)            

#take that feature vector and give it to 128 neurons.
#These 128 neurons have their own weights and biases, which are trainable. (input*weight+bias = prediction)
#ReLU is the activation function that determines the output of each neuron.
#The new Dense layer is trainable, so its weights and biases are updated during training.
x = layers.Dense(128, activation="relu")(x)        #Takes extracted 1D features and learns task-specific patterns using trainable weights and biases

x = layers.Dropout(0.3)(x)   ## Randomly drop 30% of activations during training to reduce overfitting

# # Produce probabilities for benign, malignant, and normal
outputs = layers.Dense(
    NUM_CLASSES,
    activation="softmax"          #Then softmax converts those values into probabilities that add up to approximately 1.
)(x)

model = keras.Model(inputs, outputs)


# -----------------------------
# Compile
# -----------------------------

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)


# -----------------------------
# Display model structure
# -----------------------------

model.summary()


# -----------------------------
# Train
# -----------------------------

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS
)


# -----------------------------
# Save trained model
# -----------------------------

model.save(MODEL_PATH)

print("\nTraining completed.")
print(f"Model saved to: {MODEL_PATH}")