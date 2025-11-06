"use client";

import { useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

/**
 * Animated grain gradient background that adapts to light/dark mode
 * Uses colors from the design system's chart palette
 */
export function GrainGradientBackground() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    // Set initial state
    checkDarkMode();

    // Watch for changes to dark mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Light mode: Muted, pastel blue/purple palette
  const lightColors = [
    "#8aa5e8", // Muted Byzantine blue
    "#a8c8db", // Muted Air superiority blue
    "#d9edfa", // Very light Columbia blue
    "#7a8ed8", // Muted Persian blue
  ];

  // Dark mode: Subtle, darker versions
  const darkColors = [
    "#4a5f9f", // Subdued Byzantine blue
    "#5a7a8f", // Subdued Air superiority blue
    "#7a9fba", // Subdued Columbia blue
    "#3a4a8f", // Subdued Persian blue
  ];

  const colors = isDark ? darkColors : lightColors;
  const colorBack = isDark ? "#0a0a0a" : "#ffffff";

  return (
    <div className="fixed inset-0 -z-10 w-screen h-screen opacity-40">
      <GrainGradient
        width="100%"
        height="100%"
        colors={colors}
        colorBack={colorBack}
        softness={0.5}
        intensity={0.5}
        noise={0.25}
        shape="corners"
        speed={1.0}
      />
    </div>
  );
}
