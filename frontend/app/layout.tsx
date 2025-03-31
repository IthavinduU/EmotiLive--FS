import type React from "react"
import "./globals.css"

export const metadata = {
  title: "EmotiLive : Student Monitoring System",
  description: "Monitor student emotions and behavior in real-time",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

