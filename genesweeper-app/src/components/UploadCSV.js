import React, { useState } from 'react';
import axios from 'axios';

function UploadCSV() {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('csv_file', file);

        axios.post('http://127.0.0.1:8000/api/upload-csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(response => {
            console.log(response.data);
            alert('File uploaded and processed!');
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <button type="submit">Upload CSV</button>
        </form>
    );
}

export default UploadCSV;
