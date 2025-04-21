// components/NavigationBar.js (example)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavigationBar() {
  const { isAuthenticated, logout } = useAuth(); // Assuming you have an authentication context or hook
  const navigate = useNavigate(); // Assuming you are using react-router-dom for navigation

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>


        {isAuthenticated ? (
          <>
            <li><Link to="/upload">Upload</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
            <li><Link to="/sweeps">Past Sweeps</Link></li>
            <li><Link to="/upload-and-scrape">Upload and Scrape</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavigationBar;