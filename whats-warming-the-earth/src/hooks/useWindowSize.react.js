import { useState, useEffect } from "react";

export default function useWindowSize() {

  const [windowSize, setWindowSize] = useState('lg');

  function changeWindowSize() {
    const width = window.innerWidth;

    if (width >= 1200) {
      setWindowSize('lg')
    }
    else if (width >= 992) {
      setWindowSize('md')
    }
    else if (width >= 768) {
      setWindowSize('sm')
    }
    else {
      setWindowSize('xs')
    }
  }

  useEffect(() => {

    window.addEventListener("resize", changeWindowSize);

    return () => {
      window.removeEventListener("resize", changeWindowSize);
    };

  }, []); // With this empty dependencies Array, the effect is only called once when the hook is mounted

  return windowSize;

}
