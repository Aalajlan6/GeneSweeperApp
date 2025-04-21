import React from 'react';
import Footer from './Footer';
import NavigationBar from './NavigationBar';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout flex flex-col min-h-screen">
      <header>
        <NavigationBar />
      </header>

      <main className="layout-main flex-grow">
        {children}
      </main>

    </div>
  );
}

export default Layout;
