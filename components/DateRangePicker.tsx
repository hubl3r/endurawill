// /components/DateRangePicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear
}: DateRangePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // When user clicks outside the calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCalendar && !target.closest('.date-range-picker')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (selectingStart) {
      onStartDateChange(dateString);
      onEndDateChange(''); // Clear end date when selecting new start
      setSelectingStart(false);
    } else {
      const start = startDate ? new Date(startDate) : null;
      if (start && date < start) {
        // If clicked date is before start, swap them
        onEndDateChange(startDate);
        onStartDateChange(dateString);
      } else {
        onEndDateChange(dateString);
      }
      setSelectingStart(true);
      setShowCalendar(false); // Close after selecting end date
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= start && date <= end;
  };

  const isDateInHoverRange = (date: Date): boolean => {
    if (!startDate || !hoverDate || endDate) return false;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const hover = new Date(hoverDate);
    hover.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (hover < start) {
      return date >= hover && date <= start;
    }
    return date >= start && date <= hover;
  };

  const isStartDate = (date: Date): boolean => {
    if (!startDate) return false;
    return date.toISOString().split('T')[0] === startDate;
  };

  const isEndDate = (date: Date): boolean => {
    if (!endDate) return false;
    return date.toISOString().split('T')[0] === endDate;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add empty cells for days before month starts
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(new Date(year, month, -(startDayOfWeek - i - 1)));
    }
    
    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleClear = () => {
    onClear();
    setSelectingStart(true);
    setHoverDate(null);
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();

  return (
    <div className="date-range-picker relative">
      {/* Input Display */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[280px]"
        >
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700 flex-1 text-left">
            {startDate && endDate ? (
              `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
            ) : startDate ? (
              `${formatDisplayDate(startDate)} - Select end date`
            ) : (
              'Select date range'
            )}
          </span>
        </button>
        
        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear dates"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[320px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-base font-semibold text-gray-900">{monthName}</h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const inRange = isDateInRange(date);
              const inHoverRange = isDateInHoverRange(date);
              const isStart = isStartDate(date);
              const isEnd = isEndDate(date);
              const isCurrent = isCurrentMonth(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={!isCurrent}
                  className={`
                    relative h-9 text-sm rounded-lg transition-colors
                    ${!isCurrent ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${isCurrent && !inRange && !inHoverRange && !isStart && !isEnd ? 'text-gray-700 hover:bg-gray-100' : ''}
                    ${inRange || inHoverRange ? 'bg-blue-50' : ''}
                    ${isStart || isEnd ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700' : ''}
                    ${isToday && !isStart && !isEnd ? 'ring-2 ring-blue-600 ring-inset' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Helper Text */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {selectingStart ? 'Select start date' : 'Select end date'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
