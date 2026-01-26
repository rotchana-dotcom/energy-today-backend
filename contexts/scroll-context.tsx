import React, { createContext, useContext, useState } from "react";

interface ScrollContextType {
  scrollY: number;
  setScrollY: (y: number) => void;
  isScrollingDown: boolean;
  setIsScrollingDown: (down: boolean) => void;
}

const ScrollContext = createContext<ScrollContextType>({
  scrollY: 0,
  setScrollY: () => {},
  isScrollingDown: false,
  setIsScrollingDown: () => {},
});

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  return (
    <ScrollContext.Provider
      value={{
        scrollY,
        setScrollY,
        isScrollingDown,
        setIsScrollingDown,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  return useContext(ScrollContext);
}
