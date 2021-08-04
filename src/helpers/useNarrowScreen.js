import { useState, useEffect } from 'react';

/**
 * Utility hook for checking if device is mobile or not.
 * @returns {boolean}true if screen is less than or equal to 640 pixels, false otherwise.
 */
const useNarrowScreen = () => {
  const narrowScreenWidth = 640; // pixels
  const [screenIsNarrow, setScreensNarrow] = useState(false);

  function checkWindowSize() {
    setScreensNarrow(window.innerWidth <= narrowScreenWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', checkWindowSize);
    checkWindowSize();
    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);

  return screenIsNarrow;
};

export default useNarrowScreen;
