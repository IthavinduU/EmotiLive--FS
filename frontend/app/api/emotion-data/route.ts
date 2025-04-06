import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB Connection URI (Replace with your actual MongoDB URI)
const MONGO_URI = "mongodb+srv://thavindul:COoDqXkgACy5PLOr@emotilivecluster.zxugaax.mongodb.net/?retryWrites=true&w=majority&appName=Emotilivecluster";
const DB_NAME = "emotilive";
const COLLECTION_NAME = "emotionlogs";

const client = new MongoClient(MONGO_URI);

// Function to connect to MongoDB
async function connectToDB() {
  if (!client.connect()) {
    await client.connect();
  }
  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

// ✅ POST: Store emotion data in MongoDB
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ✅ Validate required fields
    if (!data.student || !data.emotion) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const collection = await connectToDB();

    // ✅ Ensure timestamp is stored as a `Date` object
    const newLog = {
      timestamp: new Date(), // Store timestamp as Date, not string
      student: data.student,
      emotion: data.emotion
    };

    await collection.insertOne(newLog);

    return NextResponse.json({ message: "Data stored in MongoDB", log: newLog }, { status: 201 });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ GET: Retrieve emotion logs from MongoDB
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 0; // 0 means no limit
    
    const collection = await connectToDB();
    let query = collection.find().sort({ timestamp: -1 });
    
    // Apply limit if provided
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const logs = await query.toArray();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
