import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css'; // <-- Import your css here!
import logo from '../assets/logo.png';
function NavigationBar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
//<img src={logo} alt="GeneSweeper Logo" className="logo" />  Logo
  return (
    <nav className="navbar">
      <div className="nav-container">
          <div className="brand">
            <Link to="/" className="brand-link">
            
            GeneSweeper
            </Link>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>

          {isAuthenticated ? (
            <>
              <li><Link to="/upload">Sweep!</Link></li>
              <li><Link to="/sweeps">Past Sweeps</Link></li>
              <li><Link to="/upload-and-scrape">Upload and Scrape</Link></li>
              <li>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavigationBar;
