"use client"

import { useEffect, useRef, useState } from "react"

interface VideoFeedProps {
  onUpdateAverageEmotion: (averageEmotion: string) => void;
  onUpdateBehavior?: (behavior: string) => void; // Add new prop for behavior updates
}

export default function VideoFeed({ onUpdateAverageEmotion, onUpdateBehavior }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!hasInteracted) {
      onUpdateAverageEmotion("Not Started Yet");
      // Also update behavior card with "Not Started Yet"
      if (onUpdateBehavior) {
        onUpdateBehavior("Not Started Yet");
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasInteracted, onUpdateAverageEmotion, onUpdateBehavior]);

  const fetchLatestEmotionData = async () => {
    try {
      console.log("Fetching emotion data...");
      // Check if we're in development mode and use a fallback if needed
      const response = await fetch("/api/emotion-data?limit=10", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Error response from emotion API:", response.status);
        onUpdateAverageEmotion("Error Fetching Data");
        return;
      }
      
      const data = await response.json();
      
      if (data.logs && Array.isArray(data.logs)) {
        const emotionCounts: Record<string, number> = {};
        data.logs.forEach((log: any) => {
          if (log && log.emotion) {
            emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
          }
        });

        if (Object.keys(emotionCounts).length > 0) {
          const mostFrequentEmotion = Object.entries(emotionCounts).reduce(
            (prev, curr) => (curr[1] > prev[1] ? curr : prev),
            ["No Data", 0]
          )[0];
          
          console.log("AVERAGE EMOTION:", mostFrequentEmotion);
          onUpdateAverageEmotion(mostFrequentEmotion);
        } else {
          onUpdateAverageEmotion("No Data Available");
        }
      } else {
        console.error("Invalid data format from emotion API:", data);
        onUpdateAverageEmotion("No Data Available");
      }
    } catch (error) {
      console.error("Error fetching emotion data:", error);
      onUpdateAverageEmotion("Error Fetching Data");
    }
  };

  // New function to fetch behavior data
  const fetchLatestBehaviorData = async () => {
    try {
      console.log("Fetching behavior data...");
      const response = await fetch("/api/behaviour-data?limit=10", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Error response from behavior API:", response.status);
        if (onUpdateBehavior) {
          onUpdateBehavior("Error Fetching Data");
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.logs && Array.isArray(data.logs)) {
        const behaviorCounts: Record<string, number> = {};
        data.logs.forEach((log: any) => {
          // Look for gaze field instead of headPose
          if (log && log.gaze) {
            behaviorCounts[log.gaze] = (behaviorCounts[log.gaze] || 0) + 1;
          }
        });

        if (Object.keys(behaviorCounts).length > 0) {
          const mostFrequentBehavior = Object.entries(behaviorCounts).reduce(
            (prev, curr) => (curr[1] > prev[1] ? curr : prev),
            ["No Data", 0]
          )[0];
          
          console.log("AVERAGE GAZE:", mostFrequentBehavior);
          if (onUpdateBehavior) {
            onUpdateBehavior(mostFrequentBehavior);
          }
        } else {
          if (onUpdateBehavior) {
            onUpdateBehavior("No Data Available");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching behavior data:", error);
      if (onUpdateBehavior) {
        onUpdateBehavior("Error Fetching Data");
      }
    }
  };

  // Function to run emotion model in background
  const runEmotionModelInBackground = () => {
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          console.log("Running emotion model in background...");
          const emotionResponse = await fetch("/api/runEmotionModel", { method: "GET" });
          const emotionData = await emotionResponse.json();
          console.log("Emotion model response:", emotionData.message || "Emotion model triggered");
        } catch (error) {
          console.error("Error triggering emotion model:", error);
        }
        resolve();
      }, 0);
    });
  };

  // Function to run behavior model in background
  const runBehaviorModelInBackground = () => {
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          console.log("Running behavior model in background...");
          const behaviorResponse = await fetch("/api/runBehaviorModel", { method: "GET" });
          const behaviorData = await behaviorResponse.json();
          console.log("Behavior model response:", behaviorData.message || "Behavior model triggered");
        } catch (error) {
          console.error("Error triggering behavior model:", error);
        }
        resolve();
      }, 0);
    });
  };

  const handlePlayPause = async () => {
    setHasInteracted(true);

    if (videoRef.current) {
      if (isPlaying) {
        // STOPPING VIDEO
        videoRef.current.pause();
        onUpdateAverageEmotion("Not Started Yet");
        if (onUpdateBehavior) {
          onUpdateBehavior("Not Started Yet");
        }

        // Clear all intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        if ((window as any).behaviorIntervalRef) {
          clearInterval((window as any).behaviorIntervalRef);
          (window as any).behaviorIntervalRef = null;
        }
        
        setIsPlaying(false);
      } else {
        // STARTING VIDEO
        videoRef.current.play();
        onUpdateAverageEmotion("Loading...");
        if (onUpdateBehavior) {
          onUpdateBehavior("Loading...");
        }
        
        // Run each model in its own separate thread
        runEmotionModelInBackground();
        runBehaviorModelInBackground();

        // Fetch data immediately - this can run in parallel with the models
        fetchLatestEmotionData();
        fetchLatestBehaviorData();

        // Clear any existing intervals first
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if ((window as any).behaviorIntervalRef) {
          clearInterval((window as any).behaviorIntervalRef);
        }
        
        // Set up new intervals - both using the same pattern
        intervalRef.current = setInterval(fetchLatestEmotionData, 5000);
        (window as any).behaviorIntervalRef = setInterval(fetchLatestBehaviorData, 5000);
        
        setIsPlaying(true);
      }
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 overflow-hidden rounded-xl shadow-lg">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          src="/videos/sample.mp4"
          poster="/videos/thumbnail.jpg"
        >
          Your browser does not support the video tag.
        </video>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-indigo-900/70 via-indigo-800/40 to-transparent">
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all shadow-md"
            >
              {isPlaying ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start
                </>
              )}
            </button>
            
            <div className="text-white text-sm font-medium bg-indigo-600/60 px-3 py-1 rounded-full backdrop-blur-sm">
              Live Feed
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
