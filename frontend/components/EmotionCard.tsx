import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmotionEntry {
  timestamp: string;
  student: string;
  emotion: string;
}

export default function EmotionCard({ title }: { title: string }) {
  const [averageEmotion, setAverageEmotion] = useState("No Data");
  const [emotionData, setEmotionData] = useState<{ emotion: string; count: number; percentage: string }[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8000/ws");

      socket.onopen = () => {
        console.log("✅ WebSocket Connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("🔵 Received WebSocket Data:", data);

          if (!data || !data.logs || !Array.isArray(data.logs) || data.logs.length === 0) {
            console.warn("⚠️ No valid emotion data received");
            setAverageEmotion("No Data");
            setEmotionData([]);
            return;
          }

          // Count occurrences of each emotion
          const emotionCounts: Record<string, number> = {};
          data.logs.forEach((log: EmotionEntry) => {
            if (log.emotion) {
              emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
            }
          });

          // Sort emotions by occurrence
          const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
          const mostCommonEmotion = sortedEmotions.length > 0 ? sortedEmotions[0][0] : "No Data";
          const totalCount = sortedEmotions.reduce((sum, [, count]) => sum + count, 0);
          const formattedData = sortedEmotions.map(([emotion, count]) => ({
            emotion,
            count,
            percentage: ((count / totalCount) * 100).toFixed(2),
          }));

          setAverageEmotion(mostCommonEmotion);
          setEmotionData(formattedData);
        } catch (err) {
          console.error("❌ Error processing WebSocket message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
      };

      socket.onclose = () => {
        console.warn("🔴 WebSocket Disconnected. Attempting Reconnect...");
        reconnectTimeout = setTimeout(connectWebSocket, 3000); 
      };

      setWs(socket);
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.onclose = null; 
        socket.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-center font-bold text-xl">{averageEmotion}</p>

        {/* Display emotion percentages */}
        <div className="mt-4">
          {emotionData.length > 0 ? (
            emotionData.map(({ emotion, percentage }) => (
              <p key={emotion} className="text-sm">
                {emotion}: {percentage}%
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
