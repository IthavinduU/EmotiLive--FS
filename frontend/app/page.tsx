"use client";

import { useEffect, useState } from "react";
import EmotionCard from "@/components/EmotionCard";
import BehavioralCard from "@/components/BehavioralCard";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import VideoFeed from "@/components/video-feed";
import { motion } from "framer-motion";

interface EmotionLog {
  timestamp: string;
  student: string;
  emotion: string;
}

export default function Home() {
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const [averageEmotion, setAverageEmotion] = useState<string>("No Data");
  const [behavior, setBehavior] = useState<string>("Not Started Yet"); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/emotion-data")
      .then((res) => res.json())
      .then((data) => {
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
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Section */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                EmotiLive
              </h1>
              <nav className="flex space-x-3">
                <Link href="/">
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg transition-all duration-200 font-medium">
                    Home
                  </button>
                </Link>
                <Link href="/archive">
                  <button className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
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
          {/* Skeleton loading UI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/95 rounded-2xl shadow-lg overflow-hidden h-[500px] animate-pulse border border-indigo-100">
                <div className="w-full h-full bg-indigo-100/50"></div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white/95 rounded-2xl shadow-lg p-6 h-40 animate-pulse border border-blue-100">
                <div className="h-6 bg-blue-100/70 rounded-full w-1/2 mb-4"></div>
                <div className="h-20 bg-blue-100/50 rounded-lg"></div>
              </div>
              <div className="bg-white/95 rounded-2xl shadow-lg p-6 h-40 animate-pulse border border-violet-100">
                <div className="h-6 bg-violet-100/70 rounded-full w-1/2 mb-4"></div>
                <div className="h-20 bg-violet-100/50 rounded-lg"></div>
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              EmotiLive
            </motion.h1>
            <nav className="flex space-x-3">
              <Link href="/">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium">
                  Home
                </motion.button>
              </Link>
              <Link href="/archive">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                  Archive
                </motion.button>
              </Link>
              <Link href="/documentation">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                  Documentation
                </motion.button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome to EmotiLive</h2>
              <p className="text-indigo-100">Real-time emotion and behavior analytics for enhanced learning experiences</p>
            </div>
            <div className="hidden md:flex items-center mt-4 md:mt-0">
              <span className="bg-indigo-500/30 text-white px-3 py-1 rounded-full text-sm font-medium border border-indigo-400/30">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Live Analytics
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Feed Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2">
            <div className="bg-white/95 rounded-2xl shadow-lg overflow-hidden h-[500px] border border-indigo-100 hover:shadow-xl transition-all duration-300">
              <VideoFeed 
                onUpdateAverageEmotion={setAverageEmotion} 
                onUpdateBehavior={setBehavior} 
              />
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl duration-300 border border-blue-100">
              <EmotionCard title="Average Emotion" value={averageEmotion} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl duration-300 border border-violet-100">
              <BehavioralCard title="Average Attention" behavior={behavior} />
            </motion.div>
          </div>
        </div>

        {/* Emotion Demographics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl duration-300 border border-indigo-100">
          <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Emotion Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emotionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="emotion" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]}>
                <LabelList 
                  dataKey="percentage" 
                  position="top" 
                  formatter={(value) => `${value}%`}
                  style={{ fill: '#4b5563', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8">
          
          <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 border-t border-r border-b border-blue-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Real-time Analytics</h3>
              </div>
              <p className="text-gray-600 ml-16">Monitor student emotions and behaviors in real-time to adapt teaching strategies instantly.</p>
              <div className="mt-4 ml-16">
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 mr-2">Emotion Detection</span>
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">Live Feedback</span>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 border-t border-r border-b border-indigo-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Attention Tracking</h3>
              </div>
              <p className="text-gray-600 ml-16">Track student attention and head position to ensure engagement during learning sessions.</p>
              <div className="mt-4 ml-16">
                <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200 mr-2">Head Pose</span>
                <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200">Focus Metrics</span>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border-l-4 border-violet-500 border-t border-r border-b border-violet-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex items-center mb-4">
                <div className="bg-violet-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Privacy Focused</h3>
              </div>
              <p className="text-gray-600 ml-16">All data is processed locally with strict privacy controls to protect student information.</p>
              <div className="mt-4 ml-16">
                <span className="inline-block bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200 mr-2">Secure</span>
                <span className="inline-block bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-indigo-100">
          <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">How It Works</h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-indigo-400 to-violet-400"></div>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="relative pl-12 md:pl-20">
                <div className="absolute left-0 md:left-4 top-0 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Start the Camera
                  </h4>
                  <p className="text-gray-600">Click the play button in the video feed to begin real-time emotion and attention tracking.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative pl-12 md:pl-20">
                <div className="absolute left-0 md:left-4 top-0 bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-indigo-100">
                  <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Monitor Analytics
                  </h4>
                  <p className="text-gray-600">Watch real-time updates on the emotion and attention cards as the system analyzes facial expressions and head position.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative pl-12 md:pl-20">
                <div className="absolute left-0 md:left-4 top-0 bg-violet-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-violet-100">
                  <h4 className="font-medium text-violet-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Review Insights
                  </h4>
                  <p className="text-gray-600">Check the emotion demographics chart and visit the Archive page for detailed historical data and statistics.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
