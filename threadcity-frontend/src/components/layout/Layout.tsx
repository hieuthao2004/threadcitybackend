import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;