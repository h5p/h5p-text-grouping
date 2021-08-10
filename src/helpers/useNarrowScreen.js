import { useState, useEffect, useContext } from 'react';
import { H5PContext } from '../context/H5PContext';

/**
 * Utility hook for checking if device is mobile or not.
 * @returns {boolean}true if screen is less than or equal to 640 pixels, false otherwise.
 */
const useNarrowScreen = () => {
  const { instance } = useContext(H5PContext);
  const narrowScreenWidth = 640; // pixels
  const [screenIsNarrow, setScreensNarrow] = useState(false);

  function checkWindowSize() {
    setScreensNarrow(document.documentElement.clientWidth <= narrowScreenWidth);
  }
  useEffect(() => {
    checkWindowSize();

    instance.on('resize', function () {
      checkWindowSize();
    });
    return () => {
      instance.on('resize', function () {
        checkWindowSize();
      });
    };
  }, []);

  return screenIsNarrow;
};

export default useNarrowScreen;
