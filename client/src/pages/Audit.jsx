import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    // Fetch audit logs from the API
    axios.get('https://67f00fb52a80b06b8896c3bf.mockapi.io/api/v1/audit_logs')
      .then(response => {
        setLogs(response.data);
        setFilteredLogs(response.data);
      })
      .catch(error => {
        console.error('Error fetching audit logs:', error);
      });
  }, []);

  // Handle search
  useEffect(() => {
    let updatedLogs = logs;

    if (searchTerm) {
      updatedLogs = updatedLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction) {
      updatedLogs = updatedLogs.filter(log => log.action === filterAction);
    }

    if (filterUser) {
      updatedLogs = updatedLogs.filter(log => log.user === filterUser);
    }

    setFilteredLogs(updatedLogs);
  }, [searchTerm, filterAction, filterUser, logs]);

  // Handle sorting
  const handleSort = () => {
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredLogs(sortedLogs);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <h1>Audit Logs</h1>

      {/* Filters */}
      <div>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select onChange={(e) => setFilterAction(e.target.value)} value={filterAction}>
          <option value="">Filter by Action</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          type="text"
          placeholder="Filter by User"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
      </div>

      {/* Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Action</th>
            <th>User</th>
            <th>Entity</th>
            <th onClick={handleSort} style={{ cursor: 'pointer' }}>
              Timestamp {sortOrder === 'asc' ? '↑' : '↓'}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.user}</td>
                <td>{log.entity}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No logs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Audit;