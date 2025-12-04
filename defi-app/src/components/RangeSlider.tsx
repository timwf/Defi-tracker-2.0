import { useCallback, useRef, useEffect, useState } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  formatValue: (value: number) => string;
  label: string;
  step?: number;
}

export function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  formatValue,
  label,
  step = 1,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    // Snap to step
    return Math.round(rawValue / step) * step;
  }, [min, max, step]);

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!dragging) return;
    const newValue = getValueFromPosition(clientX);

    if (dragging === 'min') {
      onChange(Math.min(newValue, maxValue - step), maxValue);
    } else {
      onChange(minValue, Math.max(newValue, minValue + step));
    }
  }, [dragging, getValueFromPosition, minValue, maxValue, onChange, step]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleEnd = () => setDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, handleMove]);

  const minPercent = getPercentage(minValue);
  const maxPercent = getPercentage(maxValue);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-white">
          {formatValue(minValue)} - {formatValue(maxValue)}
        </span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-8 flex items-center cursor-pointer"
        onClick={(e) => {
          const newValue = getValueFromPosition(e.clientX);
          // Determine which thumb is closer
          const distToMin = Math.abs(newValue - minValue);
          const distToMax = Math.abs(newValue - maxValue);
          if (distToMin < distToMax) {
            onChange(Math.min(newValue, maxValue - step), maxValue);
          } else {
            onChange(minValue, Math.max(newValue, minValue + step));
          }
        }}
      >
        {/* Background track */}
        <div className="absolute w-full h-2 bg-slate-700 rounded-full" />

        {/* Active range */}
        <div
          className="absolute h-2 bg-yellow-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={`absolute w-6 h-6 bg-yellow-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 transition-transform ${dragging === 'min' ? 'scale-110' : 'hover:scale-110'}`}
          style={{ left: `${minPercent}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleMouseDown('min')}
        />

        {/* Max thumb */}
        <div
          className={`absolute w-6 h-6 bg-yellow-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 transition-transform ${dragging === 'max' ? 'scale-110' : 'hover:scale-110'}`}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleMouseDown('max')}
        />
      </div>
    </div>
  );
}
