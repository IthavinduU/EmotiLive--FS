import React from "react";

interface EmotionCardProps {
  title: string;
  value: string;
}

const EmotionCard: React.FC<EmotionCardProps> = ({ title, value }) => {
  // Get appropriate color class based on emotion value
  const getEmotionColorClass = () => {
    if (value === "Happy" || value === "Surprise") {
      return "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent";
    } else if (value === "Sad" || value === "Fear") {
      return "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent";
    } else if (value === "Angry" || value === "Disgust") {
      return "bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent";
    } else if (value === "Neutral") {
      return "bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent";
    } else if (value === "Not Started Yet" || value === "Loading...") {
      return "bg-gradient-to-r from-gray-500 to-slate-500 bg-clip-text text-transparent";
    } else {
      return "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent";
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">{title}</h3>
      <div className="flex items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
        <span className={`text-2xl font-bold ${getEmotionColorClass()}`}>{value}</span>
      </div>
    </div>
  );
};

export default EmotionCard;