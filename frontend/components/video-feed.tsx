"use client"

import { useEffect, useRef } from "react"

export default function VideoFeed() {
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100">
          <p class="text-gray-500">Video Feed</p>
        </div>
      `
    }
  }, [])

  return (
    <div ref={videoRef} className="w-full h-full">
      {/* Video feed will be rendered here */}
    </div>
  )
}

