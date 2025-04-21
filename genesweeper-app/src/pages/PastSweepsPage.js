// src/pages/PastSweepsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function PastSweepsPage() {
  const { accessToken } = useAuth();
  const [sweeps, setSweeps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    axios.get('http://127.0.0.1:8000/api/sweeps/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(response => {
      setSweeps(response.data);
    })
    .catch(error => {
      console.error('Error fetching sweeps:', error);
    });
  }, [accessToken]);

  const filteredSweeps = sweeps.filter(
    sweep =>
      sweep.products_selected.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sweep.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2>Past Sweeps</h2>

      <input
        type="text"
        placeholder="Search sweeps..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', width: '300px' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Products</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {filteredSweeps.map((sweep) => (
            <tr key={sweep.id}>
              <td>{new Date(sweep.date).toLocaleString()}</td>
              <td>{sweep.products_selected}</td>
              <td>
                <a href={`http://127.0.0.1:8000/media/${sweep.file_name}`} target="_blank" rel="noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PastSweepsPage;
