import { useState, useEffect } from 'react';

/**
 * Utility hook for checking if device is tablet size, or lower.
 * @returns {boolean} true if screen is less than or equal to 768 pixels, false otherwise.
 */
const useMediumScreen = () => {
  const mediumScreenWidth = 768; // pixels
  const [screenIsMedium, setScreensMedium] = useState(false);

  function checkWindowSize() {
    setScreensMedium(window.innerWidth <= mediumScreenWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', checkWindowSize);
    checkWindowSize();
    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);

  return screenIsMedium;
};

export default useMediumScreen;
