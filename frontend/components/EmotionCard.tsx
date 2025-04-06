import React from "react";

interface EmotionCardProps {
  title: string;
  value: string;
}

const EmotionCard: React.FC<EmotionCardProps> = ({ title, value }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  );
};

export default EmotionCard;