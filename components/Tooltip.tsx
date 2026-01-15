// components/Tooltip.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, className = '', position = 'right' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right':
      default:
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 rotate-180';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 rotate-90';
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2';
      case 'right':
      default:
        return 'right-full top-1/2 transform -translate-y-1/2 -rotate-90';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 ml-1 align-middle"
        aria-label="Help information"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl ${getPositionClasses()}`}
          style={{ zIndex: 9999 }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="relative">
            {content}
          </div>
          {/* Arrow */}
          <div className={`absolute ${getArrowClasses()}`}>
            <div className="border-4 border-transparent border-r-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
