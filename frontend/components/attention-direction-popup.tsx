"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AttentionDirectionPopup() {
  const [isVisible, setIsVisible] = useState(false)

  // In a real implementation, you would toggle this based on the button click
  // For demonstration purposes, we're showing it by default

  if (!isVisible) return null

  return (
    <Card className="absolute right-0 top-full mt-2 z-10 w-64">
      <CardContent className="p-4 space-y-2">
        <h4 className="font-medium">Set attention direction</h4>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => setIsVisible(false)}>
            ⚪ Front
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setIsVisible(false)}>
            ⚪ Side
          </Button>
          <p className="text-xs text-gray-500 mt-2">Set the available directions in the model</p>
        </div>
      </CardContent>
    </Card>
  )
}

