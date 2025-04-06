import React from "react";

interface BehavioralCardProps {
  title: string;
  behavior: string;
}

const BehavioralCard: React.FC<BehavioralCardProps> = ({ title, behavior }) => {
  // Determine attention status based on behavior value
  const getAttentionStatus = () => {
    if (behavior === "Not Started Yet" || behavior === "Loading...") {
      return behavior;
    }
    
    if (behavior === "No Data Available" || behavior === "Error Fetching Data") {
      return behavior;
    }
    
    // Check if head pose is looking forward
    if (behavior.toLowerCase().includes("forward") || behavior.toLowerCase().includes("center")) {
      return "Good";
    } else {
      return "Needs Improvement";
    }
  };

  // Get appropriate color class based on attention status
  const getStatusColorClass = () => {
    const status = getAttentionStatus();
    if (status === "Good") return "text-green-600";
    if (status === "Needs Improvement") return "text-amber-500";
    if (status === "Error Fetching Data") return "text-red-500";
    if (status === "No Data Available") return "text-blue-500";
    return "text-gray-600";
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <span className={`text-2xl font-bold ${getStatusColorClass()}`}>
          {getAttentionStatus()}
        </span>
      </div>
    </div>
  );
};

export default BehavioralCard;