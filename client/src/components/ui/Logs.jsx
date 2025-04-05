import React, { useEffect, useState } from 'react';

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('https://67f00fb52a80b06b8896c3bf.mockapi.io/api/v1/audit_logs')
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error('Error fetching logs:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">User ID</th>
              <th className="py-2 px-4 border-b">Action</th>
              <th className="py-2 px-4 border-b">Entity</th>
              <th className="py-2 px-4 border-b">Entity ID</th>
              <th className="py-2 px-4 border-b">Previous</th>
              <th className="py-2 px-4 border-b">New</th>
              <th className="py-2 px-4 border-b">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="py-2 px-4 border-b">{log.id}</td>
                <td className="py-2 px-4 border-b">{log.user_id}</td>
                <td className="py-2 px-4 border-b">{log.action}</td>
                <td className="py-2 px-4 border-b">{log.entity_type}</td>
                <td className="py-2 px-4 border-b">{log.entity_id}</td>
                <td className="py-2 px-4 border-b">
                  {log.previous_state ? JSON.parse(log.previous_state).title : '-'}
                </td>
                <td className="py-2 px-4 border-b">
                  {log.new_state ? JSON.parse(log.new_state).title : '-'}
                </td>
                <td className="py-2 px-4 border-b">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Logs;
