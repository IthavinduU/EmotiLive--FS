"use client"

import { useEffect, useRef, useState } from "react"

export default function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <video 
        ref={videoRef}
        className="w-full h-full max-h-[80vh] object-contain bg-gray-100"
        src="/videos/sample.mp4"  
      >
        Your browser does not support the video tag.
      </video>
      <button 
        onClick={handlePlayPause}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}

