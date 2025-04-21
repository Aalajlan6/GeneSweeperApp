import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PastSweepsPage() {
  const { accessToken } = useAuth();
  const [sweeps, setSweeps]           = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [deletingId, setDeletingId]   = useState(null);

  const itemsPerPage = 10;

  // Fetch & sort on mount / token change
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    axios.get('http://127.0.0.1:8000/api/sweeps/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then(res => {
      // newest first
      const sorted = res.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setSweeps(sorted);
      setCurrentPage(1);
    })
    .catch(err => {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to load past sweeps'
      );
      toast.error('Failed to load sweeps');
    })
    .finally(() => setLoading(false));
  }, [accessToken]);

  // debounced-ish search (updates on every keystroke here)
  const filteredSweeps = useMemo(() => {
    return sweeps.filter(sweep => {
      const q = searchQuery.toLowerCase();
      return (
        sweep.products_selected.toLowerCase().includes(q) ||
        sweep.name.toLowerCase().includes(q)
      );
    });
  }, [sweeps, searchQuery]);

  // pagination math
  const totalPages = Math.ceil(filteredSweeps.length / itemsPerPage);
  const startIdx   = (currentPage - 1) * itemsPerPage;
  const endIdx     = startIdx + itemsPerPage;
  const pageSweeps = filteredSweeps.slice(startIdx, endIdx);

  // reset to first page on new search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Delete handler
  const handleDelete = async (sweepId) => {
    if (!window.confirm('Delete this sweep?')) return;
    setDeletingId(sweepId);
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/sweeps/${sweepId}/delete/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSweeps(prev => prev.filter(s => s.id !== sweepId));
      toast.success('Sweep deleted');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail ||
        err.message ||
        'Delete failed'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Styles
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle    = {
    padding: '12px', textAlign: 'left',
    backgroundColor: '#f2f2f2', border: '1px solid #ddd'
  };
  const tdStyle    = { padding: '12px', border: '1px solid #ddd' };
  const actionStyle = {
    display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start'
  };
  const btnStyle = {
    padding: '6px 12px', border: '1px solid #007bff',
    backgroundColor: '#007bff', color: 'white',
    borderRadius: '4px', cursor: 'pointer'
  };
  const disabledBtn = { ...btnStyle, opacity: 0.6, cursor: 'not-allowed' };
  const deleteBtnStyle = {
    ...btnStyle,
    backgroundColor: '#dc3545',  // Bootstrap danger red
    borderColor:     '#dc3545'
  };
  
  const deleteDisabledStyle = {
    ...disabledBtn,
    backgroundColor: '#dc3545',
    borderColor:     '#dc3545'
  };
  return (
    <div style={{ padding: '20px' }}>
      <h2>Past Sweeps</h2>

      {/* Search + clear */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Search sweeps…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: '8px', width: '250px',
            borderRadius: '4px', border: '1px solid #ccc'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              marginLeft: '8px',
              padding: '6px 12px',
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Status messages */}
      {loading && <p>Loading sweeps…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && filteredSweeps.length === 0 && (
        <p>No sweeps found{searchQuery ? ` for “${searchQuery}”` : ''}.</p>
      )}

      {/* Count & table */}
      {!loading && !error && filteredSweeps.length > 0 && (
        <>
          <p>
            Showing {startIdx + 1}–{Math.min(endIdx, filteredSweeps.length)} of{' '}
            {filteredSweeps.length} sweeps
          </p>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Products</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageSweeps.map((sweep, idx) => {
                const bg = idx % 2 === 0 ? '#fff' : '#f9f9f9';
                const downloadUrl =
                  sweep.file_url ||
                  `http://127.0.0.1:8000/media/${sweep.name}`;
                return (
                  <tr key={sweep.id} style={{ backgroundColor: bg }}>
                    <td style={tdStyle}>
                      {new Date(sweep.date).toLocaleString()}
                    </td>
                    <td style={tdStyle}>{sweep.products_selected}</td>
                    <td style={{ ...tdStyle, ...actionStyle }}>
                    <button
                      onClick={() => handleDelete(sweep.id)}
                      disabled={deletingId === sweep.id}
                      style={deletingId === sweep.id ? deleteDisabledStyle : deleteBtnStyle}
                    >
                      {deletingId === sweep.id ? 'Deleting…' : 'Delete'}
                    </button>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ ...btnStyle, backgroundColor: '#28a745', borderColor: '#28a745' }}
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              style={currentPage === 1 ? disabledBtn : btnStyle}
            >
              Prev
            </button>
            <span style={{ margin: '0 12px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              style={currentPage === totalPages ? disabledBtn : btnStyle}
            >
              Next
            </button>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
