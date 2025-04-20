// src/pages/UploadPage.js

import React from 'react';
import UploadCSV from '../components/UploadCSV'; // Assuming you already made this component

function UploadPage() {
  return (
    <div>
      <h1>Upload CSV for Sweep</h1>
      <UploadCSV />
    </div>
  );
}

export default UploadPage;
