
import React, { useState } from 'react';

interface ScreenshotCarouselProps {
  screenshots: string[];
  toolName: string;
}

const ScreenshotCarousel: React.FC<ScreenshotCarouselProps> = ({ screenshots, toolName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) {
    return <p className="text-slate-400">No screenshots available.</p>;
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? screenshots.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === screenshots.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-lg shadow-xl">
        <img 
          src={screenshots[currentIndex]} 
          alt={`${toolName} screenshot ${currentIndex + 1}`} 
          className="w-full h-64 md:h-96 object-cover transition-transform duration-500 ease-in-out"
        />
      </div>
      {screenshots.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label="Previous screenshot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label="Next screenshot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {screenshots.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full ${currentIndex === slideIndex ? 'bg-purple-500' : 'bg-slate-400 hover:bg-slate-200'} transition-colors`}
                aria-label={`Go to screenshot ${slideIndex + 1}`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ScreenshotCarousel;
    