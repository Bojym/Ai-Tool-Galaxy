
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  color?: string; // Allow custom color
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, color = '#6C4DFF' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2', // Adjusted size for sm
    md: 'w-8 h-8 border-[3px]', // Adjusted size for md
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin`}
        style={{ borderColor: color, borderTopColor: 'transparent' }}
      ></div>
      {text && <p className="mt-2 text-sm" style={{ color: color }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;