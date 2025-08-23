import React from 'react';

interface JumanjiStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color: 'jumanji' | 'jungle' | 'gold' | 'danger' | 'success' | 'warning' | 'earth';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const JumanjiStatsCard: React.FC<JumanjiStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'jumanji':
        return 'bg-void-900/90 border-neon-bright text-neon-bright shadow-neon';
      case 'jungle':
        return 'bg-void-900/90 border-success-500 text-success-400 shadow-lg';
      case 'gold':
        return 'bg-void-900/90 border-gold-bright text-gold-bright shadow-gold';
      case 'earth':
        return 'bg-void-900/90 border-void-400 text-void-300 shadow-lg';
      case 'danger':
        return 'bg-void-900/90 border-danger-500 text-danger-400 shadow-lg';
      case 'success':
        return 'bg-void-900/90 border-success-500 text-success-400 shadow-lg';
      case 'warning':
        return 'bg-void-900/90 border-warning-500 text-warning-400 shadow-lg';
      default:
        return 'bg-void-900/90 border-neon-bright text-neon-bright shadow-neon';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className="text-4xl">
            {icon}
          </div>
        )}
        {trend && (
          <div className={`text-sm font-arcade font-bold ${trend.isPositive ? 'text-success-400' : 'text-danger-400'}`}>
            {trend.isPositive ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <h3 className="text-lg font-arcade font-bold text-gold-bright">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neon-bright/70 font-arcade">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="text-3xl font-arcade font-black text-white">
        {value}
      </div>
    </div>
  );
};

export default JumanjiStatsCard;
