import { useState, useEffect } from 'react';

const useNarrowScreen = () => {
  const narrowScreenWidth = 640;
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
