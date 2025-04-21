// components/Layout.js
import React from 'react';
import Footer from './Footer';
import NavigationBar from './NavigationBar';
import './Layout.css';
function Layout({ children }) {
  return (
    <div className="layout">
      <header>
        <NavigationBar />
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;
