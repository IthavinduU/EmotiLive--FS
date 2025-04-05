"use client";

import { useEffect, useState } from "react";
import { calculateEmotionStats, calculateBehaviorStats } from "@/utils/calculateStats";
import Link from "next/link";

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
        const logs = Array.isArray(data?.logs) ? data.logs : [];
        setEmotionLogs(logs);
        setEmotionStats(calculateEmotionStats(logs)); // Pass the safe logs array
      })
      .catch((err) => {
        console.error("Error fetching emotion logs:", err);
        setEmotionLogs([]);
        setEmotionStats({});
      });
  
    // Fetch Behavior Logs
    fetch("/api/behaviour-data")
      .then((res) => res.json())
      .then((data) => {
        const logs = Array.isArray(data?.logs) ? data.logs : [];
        setBehaviorLogs(logs);
        setBehaviorStats(calculateBehaviorStats(logs)); // Pass the safe logs array
      })
      .catch((err) => {
        console.error("Error fetching behavior logs:", err);
        setBehaviorLogs([]);
        setBehaviorStats({ gazeCounts: {}, headPoseCounts: {} });
      });
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section - Matching home page */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EmotiLive
            </h1>
            <nav className="flex space-x-4">
              <Link href="/">
                <button className="text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Home
                </button>
              </Link>
              <Link href="/archive">
                <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Archive
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Student Logs</h1>

        {/* Model Trigger Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={triggerEmotionModel}
            disabled={loadingEmotion}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {loadingEmotion ? "Running Emotion Model..." : "Trigger Emotion Model"}
          </button>

          <button
            onClick={triggerBehaviorModel}
            disabled={loadingBehavior}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {loadingBehavior ? "Running Behavior Model..." : "Trigger Behavior Model"}
          </button>
        </div>

        {/* Stats and Logs Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Emotion Stats Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Emotion Statistics</h2>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              {Object.keys(emotionStats).length === 0 ? (
                <p className="text-gray-500">No emotion stats available</p>
              ) : (
                <ul className="space-y-3">
                  {Object.entries(emotionStats).map(([emotion, count]) => (
                    <li key={emotion} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <span className="font-medium">{emotion}</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {count} occurrences
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Behavior Stats Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Behavior Statistics</h2>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              {Object.keys(behaviorStats.gazeCounts).length === 0 &&
              Object.keys(behaviorStats.headPoseCounts).length === 0 ? (
                <p className="text-gray-500">No behavior stats available</p>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-3 text-gray-700">Gaze Statistics</h3>
                  <ul className="space-y-2 mb-6">
                    {Object.entries(behaviorStats.gazeCounts).map(([gaze, count]) => (
                      <li key={gaze} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                        <span className="font-medium">{gaze}</span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                          {count} occurrences
                        </span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="text-lg font-medium mb-3 text-gray-700">Head Pose Statistics</h3>
                  <ul className="space-y-2">
                    {Object.entries(behaviorStats.headPoseCounts).map(([headPose, count]) => (
                      <li key={headPose} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                        <span className="font-medium">{headPose}</span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                          {count} occurrences
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Logs Sections */}
        <div className="grid grid-cols-1 gap-8 mt-8">
          {/* Emotion Logs Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Emotion Logs</h2>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              {emotionLogs.length === 0 ? (
                <p className="text-gray-500">No emotion logs available</p>
              ) : (
                <ul className="space-y-2 divide-y divide-gray-100">
                  {emotionLogs.map((log, index) => (
                    <li key={index} className="p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{log.timestamp}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {log.emotion}
                        </span>
                      </div>
                      <div className="font-medium mt-1">{log.student}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Behavior Logs Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Behavior Logs</h2>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              {behaviorLogs.length === 0 ? (
                <p className="text-gray-500">No behavior logs available</p>
              ) : (
                <ul className="space-y-2 divide-y divide-gray-100">
                  {behaviorLogs.map((log, index) => (
                    <li key={index} className="p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{log.timestamp}</span>
                      </div>
                      <div className="font-medium mt-1">{log.student}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                          Gaze: {log.gaze}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Head Pose: {log.head_pose}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
