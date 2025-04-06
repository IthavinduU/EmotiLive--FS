import cv2
import numpy as np
import time
import datetime
import face_recognition
import requests
import pymongo
from scipy.spatial import distance
from eye_movement import process_eye_movement
from head_pose import process_head_pose

# 🔹 MongoDB Setup
client = pymongo.MongoClient("mongodb+srv://thavindul:COoDqXkgACy5PLOr@emotilivecluster.zxugaax.mongodb.net/?retryWrites=true&w=majority&appName=Emotilivecluster")
db = client["emotilive"]  # Database name
collection = db["behaviourlogs"]  # Collection name

# 🔹 Next.js API endpoint for behavior data
NEXTJS_API_URL = "http://localhost:3000/api/behavior-data"

# 🔹 Video source
video_file_path = r"D:\University\IIT\Level 7\Final Year Project\MVP\EmotiLive\Fullstack\frontend\public\videos\sample.mp4"
cap = cv2.VideoCapture(video_file_path)

# 🔹 Face tracking setup
known_face_encodings = []
known_face_ids = []
next_face_id = 1

# 🔹 Behavior tracking dictionary
student_behavior_data = {}

# 🔹 Time intervals
update_interval = 5  # seconds
log_interval = 30  # Log every 30 seconds
last_log_time = time.time()


# ✅ Function to send behavior data to Next.js API
def send_behavior_data(student_behavior_data):
    for face_id, (last_seen, gaze, head_pose, count) in student_behavior_data.items():
        student_data = {
            "student": f"Student_{face_id}",
            "gaze": gaze,
            "head_pose": head_pose,
            "timestamp": datetime.datetime.utcnow().isoformat(),
        }
        response = requests.post(NEXTJS_API_URL, json=student_data)

        if response.status_code == 201:
            print(f"Sent to Next.js: {student_data}")
        else:
            print(f"Failed to send: {response.status_code}, {response.text}")


# ✅ Function to log behavior data in MongoDB
def log_behavior():
    timestamp = datetime.datetime.now()
    
    for face_id, (last_seen, gaze, head_pose, count) in student_behavior_data.items():
        if time.time() - last_seen < 120:  # Log only if recently seen
            data_entry = {
                "timestamp": timestamp,
                "student": f"Student_{face_id}",
                "gaze": gaze,
                "head_pose": head_pose,
            }
            collection.insert_one(data_entry)
            print(f"Logged in MongoDB: {data_entry}")

    # Send data to Next.js API
    send_behavior_data(student_behavior_data)


# 🔹 Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# ✅ Process video frames
while True:
    ret, frame = cap.read()
    if not ret:
        print("End of video or failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    current_time = time.time()
    if current_time - last_log_time >= log_interval:
        log_behavior()
        last_log_time = current_time

    for x, y, w, h in faces:
        face_roi = frame[y:y + h, x:x + w]
        rgb_small_frame = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
        face_encoding = face_recognition.face_encodings(rgb_small_frame)

        if face_encoding:
            face_encoding = face_encoding[0]
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
            face_id = None

            if True in matches:
                match_index = matches.index(True)
                face_id = known_face_ids[match_index]
            else:
                face_id = next_face_id
                next_face_id += 1
                known_face_encodings.append(face_encoding)
                known_face_ids.append(face_id)

            # 🔹 Process eye movement
            _, gaze_direction = process_eye_movement(face_roi)

            # 🔹 Process head pose
            _, head_direction = process_head_pose(face_roi, None)

            # 🔹 Update behavior tracking data
            if (
                face_id not in student_behavior_data
                or current_time - student_behavior_data[face_id][0] > update_interval
            ):
                student_behavior_data[face_id] = (current_time, gaze_direction, head_direction, 1)
            else:
                student_behavior_data[face_id] = (current_time, gaze_direction, head_direction, student_behavior_data[face_id][3] + 1)

            # 🔹 Display behavior data
            cv2.putText(frame, f"Student {face_id}: Gaze {gaze_direction}", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Head: {head_direction}", (x, y - 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    cv2.imshow("Student Behavior Monitoring", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        log_behavior()
        break

cap.release()
cv2.destroyAllWindows()
