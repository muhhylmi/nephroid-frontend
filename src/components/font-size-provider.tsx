"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type FontSize = "normal" | "large" | "xlarge";

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  const applyFontSize = (size: FontSize) => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (size === "normal") {
      html.style.fontSize = "16px";
    } else if (size === "large") {
      html.style.fontSize = "19px";
    } else if (size === "xlarge") {
      html.style.fontSize = "22px";
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("nephroaid-font-size") as FontSize;
    if (saved && ["normal", "large", "xlarge"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFontSizeState(saved);
      applyFontSize(saved);
    }
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("nephroaid-font-size", size);
    applyFontSize(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}
