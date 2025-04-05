import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# Allow WebSocket connections from any origin (Adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["emotilive"]  # Database name
collection = db["emotionlogs"]  # Collection name

# Store connected WebSocket clients
connected_clients = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handles WebSocket connections."""
    await websocket.accept()
    connected_clients.add(websocket)
    print("New WebSocket client connected.")

    try:
        while True:
            await asyncio.sleep(10)  # Keep the connection alive
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print("WebSocket client disconnected.")

async def send_emotion_update(emotion_data):
    """Sends emotion updates to all connected clients."""
    for client in list(connected_clients):  # Iterate over a copy to prevent runtime errors
        try:
            await client.send_json(emotion_data)
        except Exception:
            connected_clients.remove(client)  # Remove disconnected clients

async def watch_database():
    """Monitors MongoDB for changes and sends updates in real-time."""
    async with collection.watch() as stream:
        async for change in stream:
            # Fetch the latest emotions (limit 20 for optimization)
            latest_data = await collection.find().sort("timestamp", -1).limit(20).to_list(None)

            # Prepare data for frontend
            formatted_data = [{"timestamp": d["timestamp"], "student": d["student"], "emotion": d["emotion"]} for d in latest_data]

            print("Database update detected, sending to clients...")
            await send_emotion_update({"logs": formatted_data})

@app.on_event("startup")
async def start_watch():
    """Runs the database watcher in the background."""
    asyncio.create_task(watch_database())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
