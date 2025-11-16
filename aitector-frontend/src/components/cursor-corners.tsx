"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** * 
 * Usage:
 * 1. Import and add <CursorCorners /> to your page
 * 2. Add `data-magnetic` attribute to any element you want to highlight
 * 
 * @example
 * <CursorCorners />
 * <div data-magnetic>This element will be highlighted on hover</div>
 */
export function CursorCorners() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [hoveredElement, setHoveredElement] = useState<DOMRect | null>(null);

  const springConfig = { damping: 50, stiffness: 750 };
  
  // Four corners relative to cursor or element
  const topLeftX = useSpring(cursorX, springConfig);
  const topLeftY = useSpring(cursorY, springConfig);
  const topRightX = useSpring(cursorX, springConfig);
  const topRightY = useSpring(cursorY, springConfig);
  const bottomLeftX = useSpring(cursorX, springConfig);
  const bottomLeftY = useSpring(cursorY, springConfig);
  const bottomRightX = useSpring(cursorX, springConfig);
  const bottomRightY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check if hovering over a magnetic element
      const magneticElements = document.querySelectorAll('[data-magnetic]');
      let foundHover = false;

      magneticElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          setHoveredElement(rect);
          foundHover = true;
          
          // Snap to element corners with padding/offset
          const padding = 5; // Distance from edge (increase for more space)
          topLeftX.set(rect.left - padding);
          topLeftY.set(rect.top - padding);
          topRightX.set(rect.right + padding);
          topRightY.set(rect.top - padding);
          bottomLeftX.set(rect.left - padding);
          bottomLeftY.set(rect.bottom + padding);
          bottomRightX.set(rect.right + padding);
          bottomRightY.set(rect.bottom + padding);
        }
      });

      if (!foundHover) {
        setHoveredElement(null);
        // Follow cursor with slight offset to form a small square
        const offset = 20;
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        topLeftX.set(e.clientX - offset);
        topLeftY.set(e.clientY - offset);
        topRightX.set(e.clientX + offset);
        topRightY.set(e.clientY - offset);
        bottomLeftX.set(e.clientX - offset);
        bottomLeftY.set(e.clientY + offset);
        bottomRightX.set(e.clientX + offset);
        bottomRightY.set(e.clientY + offset);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, topLeftX, topLeftY, topRightX, topRightY, bottomLeftX, bottomLeftY, bottomRightX, bottomRightY]);

  const cornerSize = 10;
  const cornerThickness = 3;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Top-Left Corner */}
      <motion.div
        style={{ x: topLeftX, y: topLeftY }}
        className="absolute"
      >
        <svg width={cornerSize} height={cornerSize}>
          <path
            d={`M ${cornerSize} 0 L 0 0 L 0 ${cornerSize}`}
            stroke="rgb(168, 85, 247)"
            strokeWidth={cornerThickness}
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Top-Right Corner */}
      <motion.div
        style={{ x: topRightX, y: topRightY }}
        className="absolute -translate-x-full"
      >
        <svg width={cornerSize} height={cornerSize}>
          <path
            d={`M 0 0 L ${cornerSize} 0 L ${cornerSize} ${cornerSize}`}
            stroke="rgb(168, 85, 247)"
            strokeWidth={cornerThickness}
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Bottom-Left Corner */}
      <motion.div
        style={{ x: bottomLeftX, y: bottomLeftY }}
        className="absolute -translate-y-full"
      >
        <svg width={cornerSize} height={cornerSize}>
          <path
            d={`M 0 0 L 0 ${cornerSize} L ${cornerSize} ${cornerSize}`}
            stroke="rgb(168, 85, 247)"
            strokeWidth={cornerThickness}
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Bottom-Right Corner */}
      <motion.div
        style={{ x: bottomRightX, y: bottomRightY }}
        className="absolute -translate-x-full -translate-y-full"
      >
        <svg width={cornerSize} height={cornerSize}>
          <path
            d={`M ${cornerSize} 0 L ${cornerSize} ${cornerSize} L 0 ${cornerSize}`}
            stroke="rgb(168, 85, 247)"
            strokeWidth={cornerThickness}
            fill="none"
          />
        </svg>
      </motion.div>
    </div>
  );
}
