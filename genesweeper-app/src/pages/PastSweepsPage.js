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
      sweep.name.toLowerCase().includes(searchQuery.toLowerCase()) // ✅ Corrected
  );

  const handleDeleteSweep = (sweepId) => {
    if (!window.confirm('Are you sure you want to delete this sweep?')) return; // ✅ Added confirm

    axios.delete(`http://127.0.0.1:8000/api/sweeps/${sweepId}/delete/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // ✅ Corrected
      }
    })
    .then(response => {
      console.log('Deleted sweep:', response.data);
      setSweeps(prevSweeps => prevSweeps.filter(sweep => sweep.id !== sweepId));
    })
    .catch(error => {
      console.error('Error deleting sweep:', error.response?.data || error.message);
    });
  };

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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSweeps.map((sweep) => (
            <tr key={sweep.id}>
              <td>{new Date(sweep.date).toLocaleString()}</td>
              <td>{sweep.products_selected}</td>
              <td style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => handleDeleteSweep(sweep.id)} 
                  style={{ color: 'red' }}
                >
                  Delete
                </button>
                <a 
                  href={`http://127.0.0.1:8000/media/${sweep.name}`} //This might need to be changed.
                  target="_blank" 
                  rel="noreferrer"
                  style={{ textAlign: 'center' }}
                >
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
