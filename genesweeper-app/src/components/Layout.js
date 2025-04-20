// components/Layout.js
import React from 'react';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div>
      <header>
        <h1>GeneSweeper App</h1>
      </header>
      <main>
        {children}
      </main>

    </div>
  );
}

export default Layout;
