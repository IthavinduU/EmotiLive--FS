'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const DocumentationPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              EmotiLive
            </motion.h1>
            <nav className="flex space-x-3">
              <Link href="/">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                  Home
                </motion.button>
              </Link>
              <Link href="/archive">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-gray-700 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                  Archive
                </motion.button>
              </Link>
              <Link href="/documentation">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium">
                  Documentation
                </motion.button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-6 border-b pb-2">📘 EmotiLive Documentation</h1>

        {/* How to Run */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">🔧 How to Run</h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm space-y-3 text-gray-800">
            <p>To run the EmotiLive system locally, follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Ensure <strong>MongoDB</strong> is running locally or use MongoDB Atlas.</li>
              <li>Run the emotion recognition and behavior analysis models manually or via scripts.</li>
              <li>Launch the Next.js frontend:
                <pre className="bg-gray-900 text-green-400 text-sm p-2 rounded mt-1">npm run dev</pre>
              </li>
            </ol>
          </div>
        </section>

        {/* Data Storage */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">📦 Data Storage Details</h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm text-gray-800 space-y-3">
            <p>EmotiLive stores detected emotion data in a MongoDB collection. Each entry is associated with a unique face and timestamped for tracking engagement.</p>
            <div>
              <h3 className="font-semibold mb-2">Sample MongoDB Document:</h3>
              <pre className="bg-gray-900 text-yellow-200 text-sm p-4 rounded overflow-x-auto">
{`{
  _id: ObjectId,
  face_id: "face_12345",
  emotion: "happy",
  timestamp: "2025-05-07T13:20:00Z",
}`}
              </pre>
            </div>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
};

export default DocumentationPage;
