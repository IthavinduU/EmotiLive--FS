import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// 🔹 MongoDB Connection URI
const MONGO_URI = "mongodb+srv://thavindul:COoDqXkgACy5PLOr@emotilivecluster.zxugaax.mongodb.net/?retryWrites=true&w=majority&appName=Emotilivecluster";
const DB_NAME = "emotilive"; // Database name
const COLLECTION_NAME = "behaviourlogs"; // Collection name

let client: MongoClient | null = null;

// 🔹 Function to get MongoDB client (singleton pattern)
async function getClient() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

// 🔹 POST: Store Behavior Log in MongoDB
export async function POST(req: Request) {
  try {
    const data = await req.json(); // Get JSON data from request

    // ✅ Validate required fields
    if (!data.student || !data.gaze || !data.head_pose || !data.timestamp) {
      return NextResponse.json(
        { message: "Invalid data format" },
        { status: 400 }
      );
    }

    const collection = await getClient();

    // ✅ Ensure timestamp is stored as a Date object
    const logEntry = {
      student: data.student,
      gaze: data.gaze,
      head_pose: data.head_pose,
      timestamp: new Date(data.timestamp), // Convert to Date object
    };

    // 🔹 Insert into MongoDB
    await collection.insertOne(logEntry);

    return NextResponse.json({
      message: "Behavior data stored successfully",
      log: logEntry,
    });
  } catch (error) {
    console.error("Error saving behavior log:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// 🔹 GET: Fetch All Behavior Logs from MongoDB
export async function GET() {
  try {
    const collection = await getClient();
    const logs = await collection.find({}).sort({ timestamp: -1 }).toArray(); // Get all logs, latest first

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching behavior logs:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
