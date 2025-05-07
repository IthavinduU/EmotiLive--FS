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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section - Matching home page */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              EmotiLive
            </h1>
            <nav className="flex space-x-3">
              <Link href="/">
                <button className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                  Home
                </button>
              </Link>
              <Link href="/archive">
                <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium">
                  Archive
                </button>
              </Link>
              <Link href="/documentation">
                <button className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                  Documentation
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Student Analytics Archive</h1>

        {/* Model Trigger Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={triggerEmotionModel}
            disabled={loadingEmotion}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-md transition-all duration-200 font-medium disabled:opacity-70 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
            </svg>
            {loadingEmotion ? "Running Emotion Model..." : "Trigger Emotion Model"}
          </button>

          <button
            onClick={triggerBehaviorModel}
            disabled={loadingBehavior}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-md transition-all duration-200 font-medium disabled:opacity-70 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {loadingBehavior ? "Running Behavior Model..." : "Trigger Behavior Model"}
          </button>
        </div>

        {/* Stats and Logs Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Emotion Stats Section */}
          <section className="transition-all duration-300 hover:transform hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
              </svg>
              Emotion Statistics
            </h2>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl duration-300 border border-indigo-100">
              {Object.keys(emotionStats).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No emotion stats available</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {Object.entries(emotionStats).map(([emotion, count]) => (
                    <li key={emotion} className="p-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl flex justify-between items-center border border-indigo-50 shadow-sm">
                      <span className="font-medium text-gray-800">{emotion}</span>
                      <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        {count} occurrences
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Behavior Stats Section */}
          <section className="transition-all duration-300 hover:transform hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Behavior Statistics
            </h2>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl duration-300 border border-purple-100">
              {Object.keys(behaviorStats.gazeCounts).length === 0 &&
              Object.keys(behaviorStats.headPoseCounts).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p>No behavior stats available</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Gaze Statistics</h3>
                  <ul className="space-y-3 mb-6">
                    {Object.entries(behaviorStats.gazeCounts).map(([gaze, count]) => (
                      <li key={gaze} className="p-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-xl flex justify-between items-center border border-purple-50 shadow-sm">
                        <span className="font-medium text-gray-800">{gaze}</span>
                        <span className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                          {count} occurrences
                        </span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="text-lg font-medium mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Head Pose Statistics</h3>
                  <ul className="space-y-3">
                    {Object.entries(behaviorStats.headPoseCounts).map(([headPose, count]) => (
                      <li key={headPose} className="p-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-xl flex justify-between items-center border border-purple-50 shadow-sm">
                        <span className="font-medium text-gray-800">
                          {headPose.length > 30 ? headPose.substring(0, 30) + '...' : headPose}
                        </span>
                        <span className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
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
        <div className="grid grid-cols-1 gap-10 mt-10">
          {/* Emotion Logs Section */}
          <section className="transition-all duration-300 hover:transform hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Emotion Logs
            </h2>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl duration-300 border border-indigo-100">
              {emotionLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>No emotion logs available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-100 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Timestamp</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Emotion</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-indigo-50">
                      {emotionLogs.map((log, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-indigo-50/30' : 'bg-indigo-50/20 hover:bg-indigo-50/40'} style={{transition: 'all 0.2s'}}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{log.student}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 shadow-sm">
                              {log.emotion}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Behavior Logs Section */}
          <section className="transition-all duration-300 hover:transform hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Behavior Logs
            </h2>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl duration-300 border border-purple-100">
              {behaviorLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>No behavior logs available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-purple-100 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-violet-50">
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Timestamp</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Gaze</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Head Pose</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-purple-50">
                      {behaviorLogs.map((log, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-purple-50/30' : 'bg-purple-50/20 hover:bg-purple-50/40'} style={{transition: 'all 0.2s'}}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{log.student}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 shadow-sm">
                              {log.gaze}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-800 shadow-sm">
                              {log.head_pose}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
