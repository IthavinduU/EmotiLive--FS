export function calculateEmotionStats(logs: { emotion: string }[]) {
    const emotionCounts: Record<string, number> = {};
  
    logs.forEach((log) => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
    });
  
    return emotionCounts;
  }
  
  export function calculateBehaviorStats(logs: { gaze: string; head_pose: string }[]) {
    const gazeCounts: Record<string, number> = {};
    const headPoseCounts: Record<string, number> = {};
  
    logs.forEach((log) => {
      gazeCounts[log.gaze] = (gazeCounts[log.gaze] || 0) + 1;
      headPoseCounts[log.head_pose] = (headPoseCounts[log.head_pose] || 0) + 1;
    });
  
    return { gazeCounts, headPoseCounts };
  }
  