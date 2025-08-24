import React, { useState, useEffect } from 'react';

interface SessionTimerProps {
  startTime: string;
  firstHourPrice?: number;
  extraHourPrice?: number;
  capacity?: number;
  onUpdate?: (elapsedTime: number) => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ startTime, firstHourPrice = 30, extraHourPrice = 30, capacity = 1, onUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const elapsed = now - start;
      setElapsedTime(elapsed);
      
      if (onUpdate) {
        onUpdate(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const calculateCurrentCost = (): number => {
    const totalMinutes = elapsedTime / (1000 * 60);
    
    if (totalMinutes < 30) {
      return 0;
    } else if (totalMinutes < 90) { // 30min to 1h30min
      return firstHourPrice * capacity;
    } else {
      // After 1h30min: first hour + extra hours (every hour from 1h30min)
      const extraHours = Math.floor((totalMinutes - 90) / 60) + 1;
      return (firstHourPrice + (extraHours * extraHourPrice)) * capacity;
    }
  };

  const getHours = (): number => {
    const totalMinutes = elapsedTime / (1000 * 60);
    // Floor to one decimal so 4 minutes shows 0.0, 6 minutes shows 0.1
    return Math.floor((totalMinutes / 60) * 10) / 10;
  };

  const getMinutes = (): number => {
    const totalMinutes = elapsedTime / (1000 * 60);
    return Math.floor(totalMinutes % 60); // Show minutes within current hour
  };

  const getCostBreakdown = (): string => {
    const totalMinutes = elapsedTime / (1000 * 60);
    
    if (totalMinutes < 30) {
      const remaining = Math.ceil(30 - totalMinutes);
      return `First 30 min: 0 SAR • charge ${firstHourPrice * capacity} SAR in ${remaining}m`;
    } else if (totalMinutes < 90) {
      const remaining = Math.ceil(90 - totalMinutes);
      return `30min-1h30min: ${firstHourPrice * capacity} SAR • next charge ${extraHourPrice * capacity} SAR in ${remaining}m`;
    } else {
      const extraHours = Math.floor((totalMinutes - 90) / 60) + 1;
      const currentCost = (firstHourPrice + (extraHours * extraHourPrice)) * capacity;
      const minutesInCurrentHour = Math.floor((totalMinutes - 90) % 60);
      const remaining = 60 - minutesInCurrentHour;
      return `First + ${extraHours} extra hours: ${currentCost} SAR • next charge ${extraHourPrice * capacity} SAR in ${remaining}m`;
    }
  };

  const getNextCostThreshold = (): string => {
    const totalMinutes = elapsedTime / (1000 * 60);
    
    if (totalMinutes < 30) {
      const remainingMinutes = 30 - totalMinutes;
      return `Next charge in ${Math.ceil(remainingMinutes)}m (${firstHourPrice} SAR)`;
    } else if (totalMinutes < 90) {
      const remainingMinutes = 90 - totalMinutes;
      return `Next charge in ${Math.ceil(remainingMinutes)}m (${extraHourPrice} SAR)`;
    } else {
      const minutesInCurrentHour = Math.floor((totalMinutes - 90) % 60);
      const remainingMinutes = 60 - minutesInCurrentHour;
      return `Next charge in ${remainingMinutes}m (${extraHourPrice} SAR)`;
    }
  };

  return (
    <div className="bg-void-700/50 rounded-2xl border-2 border-neon-bright/50 p-6 animate-glow">
      {/* Main Timer Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-arcade font-black text-neon-bright mb-2 animate-pulse">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-neon-bright/70 font-arcade text-sm font-bold">
          ⏱️ LIVE SESSION TIMER
        </div>
      </div>
      
      {/* Cost Breakdown */}
      <div className="mb-6 p-4 bg-gold-bright/10 rounded-xl border border-gold-bright/30">
        <div className="text-center">
          <div className="text-3xl font-arcade font-black text-gold-bright mb-2">
            {calculateCurrentCost()} SAR
          </div>
          <div className="text-gold-bright/70 font-arcade text-sm font-bold mb-2">
            💰 CURRENT TOTAL COST
          </div>
          <div className="text-gold-bright/60 font-arcade text-xs">
            {getCostBreakdown()}
          </div>
        </div>
      </div>

      {/* Next Charge Info */}
      <div className="mb-6 p-3 bg-neon-bright/10 rounded-lg border border-neon-bright/30">
        <div className="text-center">
          <div className="text-neon-bright/80 font-arcade text-sm font-bold">
            ⚡ {getNextCostThreshold()}
          </div>
        </div>
      </div>
      
      {/* Time and Hours Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-neon-bright/10 rounded-xl border border-neon-bright/30">
          <div className="text-2xl font-arcade font-black text-neon-bright mb-1">
            {getHours()}
          </div>
          <div className="text-neon-bright/70 font-arcade text-xs font-bold">
            🕐 BILLABLE HOURS
          </div>
        </div>
        
        <div className="text-center p-4 bg-void-600/30 rounded-xl border border-void-500/30">
          <div className="text-2xl font-arcade font-black text-void-300 mb-1">
            {getMinutes()}
          </div>
          <div className="text-void-400 font-arcade text-xs font-bold">
            📍 CURRENT HOUR MINS
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="mt-4 p-3 bg-void-600/20 rounded-lg border border-void-500/20">
        <div className="text-center">
          <div className="text-void-300 font-arcade text-xs">
            💡 <strong>Pricing:</strong> First 30 min = {firstHourPrice} SAR per person • Then {extraHourPrice} SAR per person per hour
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
