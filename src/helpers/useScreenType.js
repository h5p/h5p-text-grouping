import { useState, useEffect, useContext } from 'react';
import { H5PContext } from '../context/H5PContext';

/**
 * Utility hook for checking if device is within
 * the mobile (640px) or tablet (768px) range.
 * @param {string} screenType 'narrow' (640px) or 'medium' (768px)
 * @returns {boolean} true if screen is less than or equal to screen type's width, false otherwise
 */
const useScreenType = (screenType) => {
  const screenTypes = {
    narrow: 640,
    medium: 768
  };
  const { instance } = useContext(H5PContext);
  const screenWidth = screenTypes[screenType]; // pixels
  const [screenIsNarrow, setScreensNarrow] = useState(false);

  function checkWindowSize() {
    setScreensNarrow(document.documentElement.clientWidth <= screenWidth);
  }
  useEffect(() => {
    checkWindowSize();

    instance.on('resize', checkWindowSize);
    return () => instance.off('resize', checkWindowSize);
  }, []);

  return screenIsNarrow;
};

export default useScreenType;
