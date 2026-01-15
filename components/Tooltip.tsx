// components/Tooltip.tsx
'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, className = '', position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 rotate-180';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 rotate-90';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 -rotate-90';
      case 'top':
      default:
        return 'top-full left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 ml-1"
        aria-label="Help information"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-[100] w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg ${getPositionClasses()}`}>
          <div className="relative">
            {content}
          </div>
          {/* Arrow */}
          <div className={`absolute ${getArrowClasses()} -mt-px`}>
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
