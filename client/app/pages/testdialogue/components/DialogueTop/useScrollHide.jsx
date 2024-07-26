import { useState, useEffect } from 'react';

export const useScrollHide = (selector) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const scrollableElement = document.querySelector(selector);
    if (!scrollableElement) {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = scrollableElement.scrollTop;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        if (isVisible) {
          setIsVisible(false);
        }
      } else {
        if (!isVisible) {
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    scrollableElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isVisible, selector]);

  return isVisible;
};
