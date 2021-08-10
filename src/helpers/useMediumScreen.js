import { useState, useEffect, useContext } from 'react';
import { H5PContext } from '../context/H5PContext';

/**
 * Utility hook for checking if device is tablet size, or lower.
 * @returns {boolean} true if screen is less than or equal to 768 pixels, false otherwise.
 */
const useMediumScreen = () => {
  const { instance } = useContext(H5PContext);
  const mediumScreenWidth = 768; // pixels
  const [screenIsMedium, setScreensMedium] = useState(false);

  function checkWindowSize() {
    setScreensMedium(document.documentElement.clientWidth <= mediumScreenWidth);
  }
  useEffect(() => {
    instance.on('resize', function () {
      checkWindowSize();
    });
    return () => {
      instance.on('resize', function () {
        checkWindowSize();
      });
    };
  }, []);

  return screenIsMedium;
};

export default useMediumScreen;
