import React, { useState, useRef, useEffect } from 'react';

const SwipeButton = ({ onSwipe, isLoading, disabled, text = "Desliza para ingresar" }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isLoading && !disabled) {
      setPosition(0);
      setIsSuccess(false);
    }
  }, [isLoading, disabled]);

  const handleDragStart = () => {
    if (disabled || isLoading || isSuccess) return;
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (!isDragging || disabled || isLoading || isSuccess) return;

    const container = containerRef.current;
    const button = buttonRef.current;
    if (!container || !button) return;

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const containerRect = container.getBoundingClientRect();
    const maxPosition = containerRect.width - button.offsetWidth;
    
    let newPosition = clientX - containerRect.left - (button.offsetWidth / 2);
    newPosition = Math.max(0, newPosition);
    newPosition = Math.min(maxPosition, newPosition);
    
    setPosition(newPosition);

    if (newPosition >= maxPosition * 0.95) {
      setIsDragging(false);
      setIsSuccess(true);
      setPosition(maxPosition);
      onSwipe();
    }
  };

  const handleDragEnd = () => {
    if (!isDragging || isSuccess) return;
    setIsDragging(false);
    setPosition(0);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-14 flex items-center justify-center rounded-xl overflow-hidden select-none transition-colors duration-300 ${disabled ? 'bg-zinc-200' : 'bg-zinc-100'}`}
    >
      <span className={`absolute text-sm font-medium transition-opacity duration-300 ${disabled ? 'text-zinc-400' : 'text-zinc-500'} ${isSuccess || isDragging ? 'opacity-0' : 'opacity-100'}`}>
        {text}
      </span>

      <div
        ref={buttonRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ 
          transform: `translateX(${position}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        className={`absolute left-1 h-12 w-16 rounded-lg flex items-center justify-center z-10 shadow-sm ${disabled ? 'bg-zinc-300 cursor-not-allowed' : 'bg-zinc-900 cursor-grab active:cursor-grabbing hover:bg-zinc-800'}`}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      <div 
        style={{ width: `${position + 32}px`, transition: isDragging ? 'none' : 'width 0.3s ease-out' }}
        className="absolute left-0 h-full bg-zinc-200/50 rounded-l-xl"
      />
    </div>
  );
};

export default SwipeButton;