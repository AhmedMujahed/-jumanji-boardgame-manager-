import React from 'react';

interface JumanjiCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const JumanjiCard: React.FC<JumanjiCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  hoverable = false
}) => {
  const baseClasses = 'bg-white dark:bg-earth-800 rounded-xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'shadow-jumanji border-earth-200 dark:border-earth-700',
    elevated: 'shadow-jumanji-lg border-earth-200 dark:border-earth-700',
    outlined: 'shadow-none border-2 border-jumanji-200 dark:border-jumanji-700',
    gradient: 'bg-gradient-to-br from-jumanji-50 to-jungle-50 dark:from-jumanji-900/20 dark:to-jungle-900/20 shadow-jumanji border-jumanji-200 dark:border-jumanji-700'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hoverable ? 'hover:shadow-jumanji-lg hover:scale-105 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${hoverClasses} ${clickableClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4">
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-jumanji-500 to-jumanji-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="text-gray-700 dark:text-gray-300">
        {children}
      </div>
      
      {/* Decorative bottom accent */}
      <div className="mt-4 h-0.5 bg-gradient-to-r from-jumanji-200 via-jungle-200 to-earth-200 dark:from-jumanji-700 dark:via-jungle-700 dark:to-earth-700 rounded-full opacity-40"></div>
    </div>
  );
};

export default JumanjiCard;
