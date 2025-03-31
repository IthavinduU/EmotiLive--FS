"use client";

import { useEffect, useState } from "react";

interface EmotionLog {
  timestamp: string;
  student: string;
  emotion: string;
}

interface BehaviorLog {
  timestamp: string;
  student: string;
  gaze: string;
  head_pose: string;
}

export default function ArchivePage() {
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);

  useEffect(() => {
    // Fetch Emotion Logs
    fetch("/api/emotion-data")
      .then((res) => res.json())
      .then((data) => setEmotionLogs(data.logs))
      .catch((err) => console.error("Error fetching emotion logs:", err));

    // Fetch Behavior Logs
    fetch("/api/behaviour-data")
      .then((res) => res.json())
      .then((data) => setBehaviorLogs(data.logs))
      .catch((err) => console.error("Error fetching behavior logs:", err));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Logs</h1>

      {/* Emotion Logs Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Emotion Logs</h2>
        <div className="border rounded p-4 bg-white shadow">
          {emotionLogs.length === 0 ? (
            <p className="text-gray-500">No emotion logs available</p>
          ) : (
            <ul className="space-y-2">
              {emotionLogs.map((log, index) => (
                <li key={index} className="p-2 border rounded">
                  {log.timestamp} - <strong>{log.student}</strong>: {log.emotion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Behavior Logs Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Behavior Logs</h2>
        <div className="border rounded p-4 bg-white shadow">
          {behaviorLogs.length === 0 ? (
            <p className="text-gray-500">No behavior logs available</p>
          ) : (
            <ul className="space-y-2">
              {behaviorLogs.map((log, index) => (
                <li key={index} className="p-2 border rounded">
                  {log.timestamp} - <strong>{log.student}</strong>: 
                  Gaze - {log.gaze}, Head Pose - {log.head_pose}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
