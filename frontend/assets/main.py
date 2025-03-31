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
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["emotilive"]  # Database name
collection = db["emotionlogs"]  # Collection name

# Load the trained emotion recognition model
model_best = load_model("face_model.h5")
class_names = ["Angry", "Disgusted", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# Video source
video_file_path = r"D:\University\IIT\Level 7\Final Year Project\MVP\EmotiLive\Emotion Recognition Model\ds3_1.mp4"
cap = cv2.VideoCapture(video_file_path)

# Dictionary to track student emotions
face_emotion_data = {}
known_face_encodings = []
known_face_ids = []
next_face_id = 1

# Time intervals
update_interval = 5  # seconds
log_interval = 30  # Log emotions every 30 seconds
last_log_time = time.time()

# Next.js API endpoint for sending emotion data
NEXTJS_API_URL = "http://localhost:3000/api/emotion-data"


def send_emotion_data(face_emotion_data):
    for face_id, (last_seen, emotion, count) in face_emotion_data.items():
        student_data = {
            "student": f"Student_{face_id}",  # Ensure student field is included
            "emotion": emotion,
            "timestamp": datetime.datetime.utcnow().isoformat(),  # Send a valid ISO timestamp if needed by Next.js API
        }
        response = requests.post(NEXTJS_API_URL, json=student_data)

        if response.status_code == 201:
            print(f"✅ Data sent: {student_data}")
        else:
            print(f"⚠️ Failed to send: {response.status_code}, {response.text}")


# Function to log emotions in MongoDB
def log_emotions():
    # Use a Date object for timestamp instead of a formatted string
    timestamp = datetime.datetime.now()

    for face_id, (last_seen, emotion, count) in face_emotion_data.items():
        if time.time() - last_seen < 120:  # Only log if recently seen
            data_entry = {
                "timestamp": timestamp,  # Date type, not string
                "student": f"Student_{face_id}",  # Use 'student' key as required by the schema
                "emotion": emotion,
                "count": count,
            }
            collection.insert_one(data_entry)  # Insert into MongoDB
            print(f"🟢 Logged in MongoDB: {data_entry}")

    # Send data to Next.js API
    send_emotion_data(face_emotion_data)


# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Process video frames
while True:
    ret, frame = cap.read()
    if not ret:
        print("End of video or failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )

    current_time = time.time()
    if current_time - last_log_time >= log_interval:
        log_emotions()
        last_log_time = current_time

    for x, y, w, h in faces:
        face_roi = frame[y : y + h, x : x + w]
        rgb_small_frame = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
        face_encoding = face_recognition.face_encodings(rgb_small_frame)

        if face_encoding:
            face_encoding = face_encoding[0]
            matches = face_recognition.compare_faces(
                known_face_encodings, face_encoding, tolerance=0.6
            )
            face_id = None

            if True in matches:
                match_index = matches.index(True)
                face_id = known_face_ids[match_index]
            else:
                face_id = next_face_id
                next_face_id += 1
                known_face_encodings.append(face_encoding)
                known_face_ids.append(face_id)

            face_image = cv2.resize(face_roi, (48, 48))
            face_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            face_image = image.img_to_array(face_image)
            face_image = np.expand_dims(face_image, axis=0)

            if (
                face_id not in face_emotion_data
                or current_time - face_emotion_data[face_id][0] > update_interval
            ):
                predictions = model_best.predict(face_image)
                emotion_label = class_names[np.argmax(predictions)]
                face_emotion_data[face_id] = (current_time, emotion_label, 1)

            emotion_label = face_emotion_data[face_id][1]
            cv2.putText(
                frame,
                f"Student {face_id}: {emotion_label}",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    cv2.imshow("Student Emotion Monitoring", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        log_emotions()
        break

cap.release()
cv2.destroyAllWindows()
