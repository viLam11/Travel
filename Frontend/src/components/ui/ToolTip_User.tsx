// src/components/ui/Tooltip.tsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type Position = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: Position;
  delay?: number;
  className?: string;
  onlyWhenTruncated?: boolean;
  onlyWhenTruncatedSelector?: string; // NEW
} 

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 200,
  className = "",
  onlyWhenTruncated = false,
  onlyWhenTruncatedSelector,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState<Position>(position);
  const [isTruncated, setIsTruncated] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Kiểm tra truncate
  useEffect(() => {
    if (!onlyWhenTruncated) return;
    const targetEl = onlyWhenTruncatedSelector
      ? triggerRef.current?.querySelector(onlyWhenTruncatedSelector)
      : triggerRef.current;
    if (!targetEl) return;

    const checkTruncate = () =>
      setIsTruncated(targetEl.scrollWidth > targetEl.clientWidth);
    checkTruncate();

    const resizeObserver = new ResizeObserver(checkTruncate);
    resizeObserver.observe(targetEl);
    return () => resizeObserver.disconnect();
  }, [onlyWhenTruncated, onlyWhenTruncatedSelector]);

  const showTooltip = () => {
    if (onlyWhenTruncated && !isTruncated) return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Auto-position
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let chosenPosition: Position = position;
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const calcPos = (pos: Position) => {
      switch (pos) {
        case "top":
          return {
            top: triggerRect.top - tooltipRect.height - margin,
            left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
          };
        case "bottom":
          return {
            top: triggerRect.bottom + margin,
            left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
          };
        case "left":
          return {
            top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
            left: triggerRect.left - tooltipRect.width - margin,
          };
        case "right":
          return {
            top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
            left: triggerRect.right + margin,
          };
      }
    };

    let pos = calcPos(position);
    const fitsHorizontally =
      pos.left >= 0 && pos.left + tooltipRect.width <= vw;
    const fitsVertically = pos.top >= 0 && pos.top + tooltipRect.height <= vh;

    if (position === "top" && !fitsVertically) chosenPosition = "bottom";
    else if (position === "bottom" && !fitsVertically) chosenPosition = "top";
    else if (position === "left" && !fitsHorizontally) chosenPosition = "right";
    else if (position === "right" && !fitsHorizontally) chosenPosition = "left";

    pos = calcPos(chosenPosition);

    setTooltipPos({
      top: Math.max(4, Math.min(pos.top, vh - tooltipRect.height - 4)),
      left: Math.max(4, Math.min(pos.left, vw - tooltipRect.width - 4)),
    });
    setActualPosition(chosenPosition);
  }, [isVisible, position]);

  const getArrowClasses = () => {
    const base = "absolute w-2 h-2 bg-gray-800 rotate-45";
    switch (actualPosition) {
      case "top":
        return `${base} bottom-[-4px] left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${base} top-[-4px] left-1/2 -translate-x-1/2`;
      case "left":
        return `${base} right-[-4px] top-1/2 -translate-y-1/2`;
      case "right":
        return `${base} left-[-4px] top-1/2 -translate-y-1/2`;
      default:
        return base;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] pointer-events-none opacity-0 animate-fadeIn"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              animation: "fadeIn 0.15s ease-out forwards",
            }}
          >
            <div className="relative bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {content}
              <div className={getArrowClasses()} />
            </div>
          </div>,
          document.body
        )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Tooltip;
