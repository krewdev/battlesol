
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-800/30 mt-12 py-4 border-t border-navy-700 z-10">
      <div className="container mx-auto px-4 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Battle-Sol. All rights reserved.</p>
        <p>A futuristic naval combat game on the Solana blockchain.</p>
      </div>
    </footer>
  );
};

export default Footer;
