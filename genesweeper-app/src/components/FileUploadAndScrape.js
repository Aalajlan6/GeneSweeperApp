import React, { useState } from 'react';
import axios from 'axios';
import './FileUploadAndScrape.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FileUploadAndScrape() {
  const [file, setFile]               = useState(null);
  const [jgiUsername, setJgiUsername] = useState('');
  const [jgiPassword, setJgiPassword] = useState('');
  const [loading, setLoading]         = useState(false);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file || !jgiUsername.trim() || !jgiPassword.trim()) {
      toast.error('Please provide file, username, and password.');
      return;
    }

    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('jgi_username', jgiUsername);
    formData.append('jgi_password', jgiPassword);

    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://127.0.0.1:8000/api/upload-and-scrape/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success(data.message || 'File processed successfully!');
      // reset
      setFile(null);
      setJgiUsername('');
      setJgiPassword('');
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred during processing.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h2>Upload & Scrape</h2>
      <form onSubmit={handleUpload}>
        <label>
          JGI Username
          <input
            type="text"
            className="form-input"
            placeholder="Enter your JGI username"
            value={jgiUsername}
            onChange={e => setJgiUsername(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <label>
          JGI Password
          <input
            type="password"
            className="form-input"
            placeholder="Enter your JGI password"
            value={jgiPassword}
            onChange={e => setJgiPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <label>
          CSV File
          <input
            type="file"
            accept=".csv"
            className="form-input"
            onChange={handleFileChange}
            disabled={loading}
            required
          />
        </label>

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Processing…' : 'Upload & Scrape'}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}