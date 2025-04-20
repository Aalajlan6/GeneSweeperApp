// components/NavigationBar.js (example)
import React from 'react';
import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/upload">Upload files</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavigationBar;