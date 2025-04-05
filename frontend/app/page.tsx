"use client";

import { useEffect, useState } from "react";
import EmotionCard from "@/components/EmotionCard";
import BehavioralCard from "@/components/BehavioralCard";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface EmotionLog {
  timestamp: string;
  student: string;
  emotion: string;
}

export default function Home() {
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const [averageEmotion, setAverageEmotion] = useState<string>("No Data");

  useEffect(() => {
    fetch("/api/emotion-data")
      .then((res) => res.json())
      .then((data) => {
        setEmotionLogs(data.logs);

        // Calculate Emotion Statistics
        const stats: Record<string, number> = {};
        data.logs.forEach((log: EmotionLog) => {
          stats[log.emotion] = (stats[log.emotion] || 0) + 1;
        });

        setEmotionStats(stats);

        // Determine the most frequent emotion
        const maxEmotion = Object.entries(stats).reduce(
          (prev, curr) => (curr[1] > prev[1] ? curr : prev),
          ["", 0]
        )[0];

        setAverageEmotion(maxEmotion || "No Data");
      })
      .catch((err) => console.error("Error fetching emotion logs:", err));
  }, []);

  // Convert Emotion Data to Percentage
  const totalEmotions = Object.values(emotionStats).reduce((sum, count) => sum + count, 0);
  const emotionData = Object.entries(emotionStats).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: totalEmotions > 0 ? ((count / totalEmotions) * 100).toFixed(1) : "0",
  }));

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* Header Section */}
      <header className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">EmotiLive</h1>
      </header>

      {/* Navigation Section */}
      <div className="mb-4 border-b pb-2">
        <div className="flex space-x-2">
          <Link href="/">
            <button className="bg-gray-200 px-4 py-2 rounded">Home</button>
          </Link>
          <Link href="/archive">
            <button className="px-4 py-2">Archive</button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Video Feed Section */}
        <div className="md:col-span-2">
          <div className="border rounded p-4 h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Video Feed</p>
          </div>
        </div>

      </div>

      {/* Emotion and Attention Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Emotion Card */}
        <EmotionCard title="Average Emotion" emotion={averageEmotion} />

        {/* Behavioral Card */}
        <BehavioralCard title="Average Attention" behavior="Good" />
      </div>

      {/* Emotion Demographics (Graph with Percentages) */}
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Emotion Demographics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={emotionData}>
            <XAxis dataKey="emotion" />
            <YAxis />
            <Tooltip formatter={(value: any) => `${value} (${((value / totalEmotions) * 100).toFixed(1)}%)`} />
            <Bar dataKey="count" fill="#8884d8">
              <LabelList dataKey="percentage" position="top" formatter={(value) => `${value}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
