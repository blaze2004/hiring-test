import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    axios.get('https://67f00fb52a80b06b8896c3bf.mockapi.io/api/v1/audit_logs')
      .then(response => {
        setLogs(response.data);
        setFilteredLogs(response.data);
      })
      .catch(error => {
        console.error('Error fetching audit logs:', error);
      });
  }, []);

  useEffect(() => {
    let updatedLogs = logs;

    if (filterAction) {
      updatedLogs = updatedLogs.filter(log => log.action === filterAction);
    }

    if (filterEntityType) {
      updatedLogs = updatedLogs.filter(log => log.entity_type === filterEntityType);
    }

    setFilteredLogs(updatedLogs);
    setCurrentPage(1);
  }, [filterAction, filterEntityType, logs]);

  const handleSort = () => {
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredLogs(sortedLogs);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const parseState = (state, entityType) => {
    if (!state) return 'N/A';
    const parsedState = JSON.parse(state);
    if (entityType === 'todo') {
      return `Title: ${parsedState.title || 'N/A'}, Completed: ${parsedState.completed ? 'Yes' : 'No'}`;
    }
    if (entityType === 'user') {
      return `Username: ${parsedState.username || 'N/A'}`;
    }
    return JSON.stringify(parsedState, null, 2);
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Audit Logs</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          onChange={(e) => setFilterAction(e.target.value)}
          value={filterAction}
          className="p-2 border border-gray-300 rounded-md w-full sm:w-1/4"
        >
          <option value="">Filter by Action</option>
        </select>
        <select
          onChange={(e) => setFilterEntityType(e.target.value)}
          value={filterEntityType}
          className="p-2 border border-gray-300 rounded-md w-full sm:w-1/4"
        >
          <option value="">Filter by Entity Type</option>
          <option value="user">User</option>
          <option value="todo">Todo</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Entity</th>
              <th className="px-4 py-2 text-left">Entity ID</th>
              <th className="px-4 py-2 text-left">New State</th>
              <th className="px-4 py-2 text-left">Previous State</th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={handleSort}
              >
                Timestamp {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length > 0 ? (
              currentLogs.map(log => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2">{log.action || 'N/A'}</td>
                  <td className="px-4 py-2">{log.user || 'N/A'}</td>
                  <td className="px-4 py-2" title={log.entity_type || 'N/A'}>
                    {log.entity_type || 'N/A'}
                  </td>
                  <td className="px-4 py-2">{log.entity_id || 'N/A'}</td>
                  <td className="px-4 py-2">
                    {parseState(log.new_state, log.entity_type)}
                  </td>
                  <td className="px-4 py-2">
                    {parseState(log.previous_state, log.entity_type)}
                  </td>
                  <td className="px-4 py-2">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-2 text-center">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            disabled={currentPage === index + 1}
            className={`px-4 py-2 mx-1 rounded-md ${
              currentPage === index + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Audit;