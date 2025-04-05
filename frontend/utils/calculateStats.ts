export function calculateBehaviorStats(logs: any[] = []) {
  const gazeCounts: Record<string, number> = {};
  const headPoseCounts: Record<string, number> = {};
  
  // Ensure logs is an array before calling forEach
  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      if (log && typeof log === 'object') {
        // Handle gaze counts
        if (log.gaze) {
          gazeCounts[log.gaze] = (gazeCounts[log.gaze] || 0) + 1;
        }
        
        // Handle head pose counts
        if (log.head_pose) {
          headPoseCounts[log.head_pose] = (headPoseCounts[log.head_pose] || 0) + 1;
        }
      }
    });
  }
  
  return { gazeCounts, headPoseCounts };
}

export function calculateEmotionStats(logs: any[] = []) {
  const emotionCounts: Record<string, number> = {};
  
  // Ensure logs is an array before calling forEach
  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      if (log && typeof log === 'object' && log.emotion) {
        emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
      }
    });
  }
  
  return emotionCounts;
}
  
  