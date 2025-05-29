
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../constants';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-extrabold text-purple-500 mb-4">404</h1>
      <h2 className="text-4xl font-bold text-slate-100 mb-6">Oops! Page Not Found</h2>
      <p className="text-slate-300 text-lg mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link
        to={APP_ROUTES.HOME}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl text-lg"
      >
        Go to Homepage
      </Link>
      <div className="mt-16">
        <svg className="w-32 h-32 text-slate-700 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 21a9.004 9.004 0 008.723-6.687M12 3a9.004 9.004 0 00-8.723 6.687" transform="rotate(30 12 12)"/>
        </svg>
      </div>
    </div>
  );
};

export default NotFoundPage;
    