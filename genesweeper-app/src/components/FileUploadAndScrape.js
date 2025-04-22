import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './FileUploadAndScrape.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FileUploadAndScrape() {
  const [file, setFile]               = useState(null);
  const [jgiUsername, setJgiUsername] = useState('');
  const [jgiPassword, setJgiPassword] = useState('');
  const [loading, setLoading]         = useState(false);
  const [progress, setProgress]       = useState(0);
  const [fastaContent, setFastaContent] = useState(null);

  const cancelSourceRef = useRef(null); // 🔥 Axios Cancel Token

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    // 🔥 Abort scraper if the user refreshes / closes
    const abortOnUnload = async () => {
      await axios.post('http://127.0.0.1:8000/api/abort-scrape/');
    };

    window.addEventListener('beforeunload', abortOnUnload);
    return () => {
      abortOnUnload();
      window.removeEventListener('beforeunload', abortOnUnload);
    };
  }, []);

  const handleAbort = async () => {
    try {
      if (cancelSourceRef.current) {
        cancelSourceRef.current.cancel("User aborted scraping.");
      }
      await axios.post('http://127.0.0.1:8000/api/abort-scrape/');
      toast.info('Scraping aborted.');
      setLoading(false);
      setProgress(0);
    } catch (err) {
      console.error('Error aborting:', err);
    }
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

    const cancelTokenSource = axios.CancelToken.source();
    cancelSourceRef.current = cancelTokenSource;

    setLoading(true);
    setProgress(0);
    setFastaContent(null);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/upload-and-scrape/',
        formData,
        {
          cancelToken: cancelTokenSource.token,
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'blob',
          onDownloadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            } else {
              setProgress(p => Math.min(p + 10, 95));
            }
          }
        }
      );

      const text = await response.data.text();
      setFastaContent(text);
      toast.success('Scrape completed! Preview below.');
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else {
        toast.error(err.response?.data?.error || 'An error occurred.');
        console.error(err);
      }
    } finally {
      setLoading(false);
      setProgress(100);
      cancelSourceRef.current = null;
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fastaContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'multioutput.fasta');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="upload-card">
      <h2>Upload & Scrape</h2>

      <form onSubmit={handleUpload}>
        <label>
          JGI Username
          <input type="text" className="form-input" value={jgiUsername} onChange={e => setJgiUsername(e.target.value)} required disabled={loading} />
        </label>
        <label>
          JGI Password
          <input type="password" className="form-input" value={jgiPassword} onChange={e => setJgiPassword(e.target.value)} required disabled={loading} />
        </label>
        <label>
          CSV File
          <input type="file" accept=".csv" className="form-input" onChange={handleFileChange} required disabled={loading} />
        </label>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing…' : 'Upload & Scrape'}
          </button>

          {/* Abort button only while loading */}
          {loading && (
            <button type="button" className="btn btn-danger" onClick={handleAbort}>
              Abort
            </button>
          )}
        </div>
      </form>

      {/* 🔄 Spinner and Progress */}
      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* 📄 Preview Area */}
      {fastaContent && (
        <div className="preview-box">
          <h4>FASTA Preview</h4>
          <textarea
            className="preview-text"
            value={fastaContent}
            readOnly
            rows={15}
          />
          <button className="btn btn-download" onClick={handleDownload}>Download multioutput.fasta</button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
