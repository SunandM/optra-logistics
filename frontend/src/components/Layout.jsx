import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children, title, subtitle }) => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content with-sidebar">
        <TopBar title={title} subtitle={subtitle} />
        {children}
      </main>
    </div>
  );
};

export default Layout;
