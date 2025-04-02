"use client";

import { useEffect, useState } from "react";
import { calculateEmotionStats, calculateBehaviorStats } from "@/utils/calculateStats";

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
  const [loadingEmotion, setLoadingEmotion] = useState(false);
  const [loadingBehavior, setLoadingBehavior] = useState(false);

  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const [behaviorStats, setBehaviorStats] = useState<{ gazeCounts: Record<string, number>; headPoseCounts: Record<string, number> }>({ gazeCounts: {}, headPoseCounts: {} });

  useEffect(() => {
    // Fetch Emotion Logs
    fetch("/api/emotion-data")
      .then((res) => res.json())
      .then((data) => {
        setEmotionLogs(data.logs);
        setEmotionStats(calculateEmotionStats(data.logs)); // Calculate stats
      })
      .catch((err) => console.error("Error fetching emotion logs:", err));

    // Fetch Behavior Logs
    fetch("/api/behaviour-data")
      .then((res) => res.json())
      .then((data) => {
        setBehaviorLogs(data.logs);
        setBehaviorStats(calculateBehaviorStats(data.logs)); // Calculate stats
      })
      .catch((err) => console.error("Error fetching behavior logs:", err));
      
  }, []);

  const triggerEmotionModel = async () => {
    setLoadingEmotion(true);
    try {
      const response = await fetch("/api/runEmotionModel", { method: "GET" });
      const data = await response.json();
      alert(data.message || "Emotion model triggered");
    } catch (error) {
      alert("Error triggering emotion model");
      console.error(error);
    } finally {
      setLoadingEmotion(false);
    }
  };

  const triggerBehaviorModel = async () => {
    setLoadingBehavior(true);
    try {
      const response = await fetch("/api/runBehaviorModel", { method: "GET" });
      const data = await response.json();
      alert(data.message || "Behavior model triggered");
    } catch (error) {
      alert("Error triggering behavior model");
      console.error(error);
    } finally {
      setLoadingBehavior(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Logs</h1>

      {/* Emotion Model Trigger Button */}
      <button
        onClick={triggerEmotionModel}
        disabled={loadingEmotion}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loadingEmotion ? "Running Emotion Model..." : "Trigger Emotion Model"}
      </button>

      {/* Behavior Model Trigger Button */}
      <button
        onClick={triggerBehaviorModel}
        disabled={loadingBehavior}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 ml-4"
      >
        {loadingBehavior ? "Running Behavior Model..." : "Trigger Behavior Model"}
      </button>

      {/* Emotion Stats Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Emotion Statistics</h2>
        <div className="border rounded p-4 bg-white shadow">
          {Object.keys(emotionStats).length === 0 ? (
            <p className="text-gray-500">No emotion stats available</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(emotionStats).map(([emotion, count]) => (
                <li key={emotion} className="p-2 border rounded">
                  {emotion}: {count} occurrences
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Behavior Stats Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Behavior Statistics</h2>
        <div className="border rounded p-4 bg-white shadow">
          {Object.keys(behaviorStats.gazeCounts).length === 0 &&
          Object.keys(behaviorStats.headPoseCounts).length === 0 ? (
            <p className="text-gray-500">No behavior stats available</p>
          ) : (
            <>
              <h3 className="text-lg font-medium">Gaze Statistics</h3>
              <ul className="space-y-2 mb-4">
                {Object.entries(behaviorStats.gazeCounts).map(([gaze, count]) => (
                  <li key={gaze} className="p-2 border rounded">
                    {gaze}: {count} occurrences
                  </li>
                ))}
              </ul>
              <h3 className="text-lg font-medium">Head Pose Statistics</h3>
              <ul className="space-y-2">
                {Object.entries(behaviorStats.headPoseCounts).map(([headPose, count]) => (
                  <li key={headPose} className="p-2 border rounded">
                    {headPose}: {count} occurrences
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

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
