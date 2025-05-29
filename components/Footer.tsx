
import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-center py-8 mt-12">
      <p className="text-[#475569] text-sm">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
      <p className="text-slate-400 text-xs mt-1">
        Discover the best AI tools, curated for you.
      </p>
      {/* Optional: Add links to social media, terms, privacy policy etc. */}
    </footer>
  );
};

export default Footer;