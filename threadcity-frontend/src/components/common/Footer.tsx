import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} ThreadCity. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;