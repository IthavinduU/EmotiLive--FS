// pages/archive.tsx
import { useState } from 'react';

export default function Archive() {
  const [logs, setLogs] = useState([
    { time: '26/03 4:32PM', student: 'Student 1', emotion: 'Happy' },
    { time: '26/03 4:33PM', student: 'Student 2', emotion: 'Sad' },
    // You can add more logs or fetch them from an API
  ]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header Section */}
      <header className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">Archive</h1>
      </header>

      {/* Logs Section */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-4">Logs</h3>
        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="flex justify-between border-b pb-2 mb-2">
                <span className="text-sm text-gray-500">{log.time}</span>
                <span className="font-semibold">{log.student}</span>
                <span className="font-bold">{log.emotion}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No logs available</p>
          )}
        </div>
      </div>
    </div>
  );
}
