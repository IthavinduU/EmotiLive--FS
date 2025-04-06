"use client";

import { useEffect, useState } from "react";
import EmotionCard from "@/components/EmotionCard";
import BehavioralCard from "@/components/BehavioralCard";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import VideoFeed from "@/components/video-feed";

interface EmotionLog {
  timestamp: string;
  student: string;
  emotion: string;
}

export default function Home() {
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const [averageEmotion, setAverageEmotion] = useState<string>("No Data");
  const [behavior, setBehavior] = useState<string>("Not Started Yet"); // Add this line
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/emotion-data")
      .then((res) => res.json())
      .then((data) => {
        // Make sure data.logs exists and is an array
        const logs = Array.isArray(data?.logs) ? data.logs : [];
        setEmotionLogs(logs);

        const stats: Record<string, number> = {};
        if (logs && logs.length > 0) {
          logs.forEach((log: EmotionLog) => {
            if (log && log.emotion) {
              stats[log.emotion] = (stats[log.emotion] || 0) + 1;
            }
          });
        }

        setEmotionStats(stats);

        if (Object.keys(stats).length > 0) {
          const maxEmotion = Object.entries(stats).reduce(
            (prev, curr) => (curr[1] > prev[1] ? curr : prev),
            ["", 0]
          )[0];
          setAverageEmotion(maxEmotion);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching emotion logs:", err);
        setEmotionStats({});
        setEmotionLogs([]);
        setIsLoading(false);
      });
  }, []);

  // Safely calculate percentages with null checks
  const totalEmotions = Object.values(emotionStats || {}).reduce((sum, count) => sum + count, 0);
  const emotionData = Object.entries(emotionStats || {}).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: totalEmotions > 0 ? ((count / totalEmotions) * 100).toFixed(1) : "0",
  }));

  // Add a loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section - Keep this visible during loading */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EmotiLive
              </h1>
              <nav className="flex space-x-4">
                <Link href="/">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Home
                  </button>
                </Link>
                <Link href="/archive">
                  <button className="text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    Archive
                  </button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton loading UI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-[500px] animate-pulse">
                <div className="w-full h-full bg-gray-200"></div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-md p-6 h-40 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 h-40 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const updateAverageEmotion = (newAverageEmotion: string) => {
    setAverageEmotion(newAverageEmotion);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EmotiLive
            </h1>
            <nav className="flex space-x-4">
              <Link href="/">
                <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Home
                </button>
              </Link>
              <Link href="/archive">
                <button className="text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Archive
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Feed Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-[500px]">
              <VideoFeed 
                onUpdateAverageEmotion={setAverageEmotion} 
                onUpdateBehavior={setBehavior} 
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              <EmotionCard title="Average Emotion" value={averageEmotion} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              <BehavioralCard title="Average Attention" behavior={behavior} />
            </div>
          </div>
        </div>

        {/* Emotion Demographics */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Emotion Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emotionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="emotion" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]}>
                <LabelList 
                  dataKey="percentage" 
                  position="top" 
                  formatter={(value) => `${value}%`}
                  style={{ fill: '#64748b', fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
