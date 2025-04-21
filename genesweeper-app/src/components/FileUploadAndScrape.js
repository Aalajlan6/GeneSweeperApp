import React, { useState } from 'react';
import axios from 'axios';

function FileUploadAndScrape() {
    const [file, setFile] = useState(null);
    const [jgiUsername, setJgiUsername] = useState('');
    const [jgiPassword, setJgiPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file || !jgiUsername || !jgiPassword) {
            setMessage('');
            setError('Please provide all required fields: file, username, and password.');
            return;
        }

        const formData = new FormData();
        formData.append('csv_file', file);
        formData.append('jgi_username', jgiUsername);
        formData.append('jgi_password', jgiPassword);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/upload-and-scrape/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message || 'File processed successfully.');
            setError('');
        } catch (err) {
            setMessage('');
            setError(err.response?.data?.error || 'An error occurred while processing the file.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Upload File for Scraping</h2>
            <form onSubmit={handleUpload}>
                <input
                    type="text"
                    placeholder="JGI Username"
                    value={jgiUsername}
                    onChange={(e) => setJgiUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="JGI Password"
                    value={jgiPassword}
                    onChange={(e) => setJgiPassword(e.target.value)}
                    required
                />
                <input type="file" onChange={handleFileChange} required />
                <button type="submit" style={{ marginTop: '10px' }}>
                    Upload and Scrape
                </button>
            </form>
            {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
            {error && <p style={{ marginTop: '20px', color: 'red' }}>{error}</p>}
        </div>
    );
}

export default FileUploadAndScrape;