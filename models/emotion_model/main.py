import cv2
import numpy as np
import time
import datetime  # We'll use datetime.datetime.now() directly
import face_recognition
import requests
import pymongo
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# MongoDB setup
client = pymongo.MongoClient(
    "mongodb+srv://thavindul:COoDqXkgACy5PLOr@emotilivecluster.zxugaax.mongodb.net/?retryWrites=true&w=majority&appName=Emotilivecluster"
)
db = client["emotilive"]  # Database name
collection = db["emotionlogs"]  # Collection name

# Load the trained emotion recognition model
model_best = load_model(
    "D:\\University\\IIT\\Level 7\\Final Year Project\\MVP\\EmotiLive\\Fullstack\\models\\emotion_model\\face_model.h5"
)
class_names = [
    "Angry",
    "Disgusted",
    "Fear",
    "Happy",
    "Sad",
    "Surprise",
    "Neutral",
]  # Emotion classes

# Video source
video_file_path = r"D:\University\IIT\Level 7\Final Year Project\MVP\EmotiLive\Emotion Recognition Model\ds3_1.mp4"
cap = cv2.VideoCapture(video_file_path)  # Open video file for processing

# Dictionary to track student emotions
face_emotion_data = {}  # Maps face_id to (last_seen_time, emotion, count)
known_face_encodings = []  # Stores face encodings to recognize known faces
known_face_ids = []  # Corresponding face IDs for the encodings
next_face_id = 1  # To assign unique IDs to new faces

# Time intervals
update_interval = 5  # Update emotion every 5 seconds per face
log_interval = 30  # Log emotions every 30 seconds
last_log_time = time.time()  # Tracks last log time

# Next.js API endpoint for sending emotion data
NEXTJS_API_URL = "http://localhost:3000/api/emotion-data"


# Send emotion data to Next.js API
def send_emotion_data(face_emotion_data):
    for face_id, (last_seen, emotion, count) in face_emotion_data.items():
        student_data = {
            "student": f"Student_{face_id}",  # Student label
            "emotion": emotion,
            "timestamp": datetime.datetime.utcnow().isoformat(),  # ISO formatted UTC timestamp
        }
        response = requests.post(NEXTJS_API_URL, json=student_data)

        if response.status_code == 201:
            print(f"Data sent: {student_data}")
        else:
            print(f"Failed to send: {response.status_code}, {response.text}")


# Log emotion data to MongoDB and send to Next.js
def log_emotions():
    timestamp = datetime.datetime.now()  # Current timestamp

    for face_id, (last_seen, emotion, count) in face_emotion_data.items():
        if time.time() - last_seen < 120:  # Only log if seen in last 2 minutes
            data_entry = {
                "timestamp": timestamp,
                "student": f"Student_{face_id}",
                "emotion": emotion,
            }
            collection.insert_one(data_entry)  # Store data in MongoDB
            print(f"Logged in MongoDB: {data_entry}")

    send_emotion_data(face_emotion_data)  # Also send data to frontend API


# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Process each video frame
while True:
    ret, frame = cap.read()  # Read a frame
    if not ret:
        print("End of video or failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)  # Convert frame to grayscale
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )  # Detect faces

    current_time = time.time()
    if current_time - last_log_time >= log_interval:
        log_emotions()  # Log emotions every 30 seconds
        last_log_time = current_time

    for x, y, w, h in faces:
        face_roi = frame[y : y + h, x : x + w]  # Region of interest for the face
        rgb_small_frame = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)  # Convert to RGB
        face_encoding = face_recognition.face_encodings(
            rgb_small_frame
        )  # Encode the face

        if face_encoding:
            face_encoding = face_encoding[0]
            matches = face_recognition.compare_faces(
                known_face_encodings, face_encoding, tolerance=0.6
            )  # Check if face is already known
            face_id = None

            if True in matches:
                match_index = matches.index(True)
                face_id = known_face_ids[match_index]  # Get existing face ID
            else:
                face_id = next_face_id  # Assign new face ID
                next_face_id += 1
                known_face_encodings.append(face_encoding)  # Store new encoding
                known_face_ids.append(face_id)

            face_image = cv2.resize(face_roi, (48, 48))  # Resize for model input
            face_image = cv2.cvtColor(
                face_image, cv2.COLOR_BGR2GRAY
            )  # Convert to grayscale
            face_image = image.img_to_array(face_image)  # Convert to array
            face_image = np.expand_dims(face_image, axis=0)  # Add batch dimension

            # Predict emotion if new or enough time has passed since last update
            if (
                face_id not in face_emotion_data
                or current_time - face_emotion_data[face_id][0] > update_interval
            ):
                predictions = model_best.predict(face_image)  # Predict emotion
                emotion_label = class_names[np.argmax(predictions)]  # Get emotion label
                face_emotion_data[face_id] = (
                    current_time,
                    emotion_label,
                    1,
                )  # Update tracking data

            emotion_label = face_emotion_data[face_id][1]  # Get latest emotion
            cv2.putText(
                frame,
                f"Student {face_id}: {emotion_label}",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )  # Show label on frame
            cv2.rectangle(
                frame, (x, y), (x + w, y + h), (0, 255, 0), 2
            )  # Draw bounding box

    cv2.imshow("Student Emotion Monitoring", frame)  # Show the frame

    if cv2.waitKey(1) & 0xFF == ord("q"):
        log_emotions()  # Final logging on exit
        break

cap.release()  # Release video capture
cv2.destroyAllWindows()  # Close OpenCV windows
