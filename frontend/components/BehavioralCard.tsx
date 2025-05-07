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
    
    // Check if behavior contains numeric values (head pose angles)
    if (/\d+/.test(behavior)) {
      // If it contains numbers, convert to meaningful descriptions
      if (behavior.toLowerCase().includes("looking forward") || 
          behavior.toLowerCase().includes("looking center") || 
          behavior.toLowerCase().includes("center")) {
        return "Focused";
      } else if (behavior.toLowerCase().includes("left")) {
        return "Looking Left";
      } else if (behavior.toLowerCase().includes("right")) {
        return "Looking Right";
      } else if (behavior.toLowerCase().includes("up")) {
        return "Looking Up";
      } else if (behavior.toLowerCase().includes("down")) {
        return "Looking Down";
      } else {
        return "Distracted";
      }
    }
    
    // Check if head pose is looking forward
    if (behavior.toLowerCase().includes("looking forward") || 
        behavior.toLowerCase().includes("looking center") || 
        behavior.toLowerCase().includes("center")) {
      return "Focused";
    } else {
      return "Distracted";
    }
  };

  // Get appropriate color class based on attention status
  const getStatusColorClass = () => {
    const status = getAttentionStatus();
    if (status === "Focused") return "bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent";
    if (status === "Distracted") return "bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent";
    if (status === "Looking Left" || status === "Looking Right") return "bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent";
    if (status === "Looking Up" || status === "Looking Down") return "bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent";
    if (status === "Error Fetching Data") return "bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent";
    if (status === "No Data Available") return "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent";
    return "bg-gradient-to-r from-gray-500 to-slate-500 bg-clip-text text-transparent";
  };

  // Get appropriate icon based on attention status
  const getStatusIcon = () => {
    const status = getAttentionStatus();
    if (status === "Focused") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (status === "Distracted") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else if (status === "Looking Left") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      );
    } else if (status === "Looking Right") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      );
    } else if (status === "Looking Up") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    } else if (status === "Looking Down") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );}
     else if (status === "Error Fetching Data") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (status === "Loading...") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">{title}</h3>
      <div className="flex items-center justify-center p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className={`text-2xl font-bold ${getStatusColorClass()}`}>
            {getAttentionStatus()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BehavioralCard;