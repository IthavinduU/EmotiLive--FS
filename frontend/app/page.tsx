import EmotionCard from "@/components/EmotionCard"; // Import EmotionCard
import BehavioralCard from "@/components/BehavioralCard"; // Import BehavioralCard
import Link from "next/link"; // Import the Link component

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* Header Section */}
      <header className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">EmotiLive</h1>
      </header>

      {/* Navigation Section */}
      <div className="mb-4 border-b pb-2">
        <div className="flex space-x-2">
          {/* Home Button */}
          <Link href="/">
            <button className="bg-gray-200 px-4 py-2 rounded">Home</button>
          </Link>

          {/* Archive Button */}
          <Link href="/archive">
            <button className="px-4 py-2">Archive</button>
          </Link>

          {/* Profile Button */}
          <Link href="/profile">
            <button className="px-4 py-2">Profile</button>
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

        {/* Log Section */}
        <div className="md:col-span-1">
          <div className="border rounded p-4 h-[300px]">
            <h3 className="font-medium mb-4">Log</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                26/03 4:32PM - Student 1 happy
              </p>
              <p className="text-sm text-gray-500">
                26/03 4:32PM - Student 2 sad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion and Attention Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Emotion Card */}
        <EmotionCard title="Average Emotion" emotion="Happy" />

        {/* Behavioral Card */}
        <BehavioralCard title="Average Attention" behavior="Good" />

        {/* Attention Direction Section */}
        <div className="border rounded p-4 flex items-center justify-between">
          <span>Set attention direction</span>
          <button className="border rounded p-1">
            <span>←</span>
          </button>
        </div>
      </div>
    </main>
  );
}
