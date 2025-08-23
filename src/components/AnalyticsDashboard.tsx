import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subMonths, startOfYear, endOfYear } from 'date-fns';
import { User, Customer, Session, RevenueData, CustomerStats, MonthlyMetrics, MonthlyAnalytics } from '../types';

interface AnalyticsDashboardProps {
  customers: Customer[];
  sessions: Session[];
  user: User;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ customers, sessions, user }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'sessions' | 'customers' | 'hours'>('revenue');

  // Load persistent analytics data from localStorage
  const [persistentData, setPersistentData] = useState<MonthlyMetrics[]>(() => {
    const saved = localStorage.getItem('jumanji_analytics_data');
    return saved ? JSON.parse(saved) : [];
  });

  // Save data to localStorage whenever it changes - but only when it actually changes
  useEffect(() => {
    if (persistentData.length > 0) {
      localStorage.setItem('jumanji_analytics_data', JSON.stringify(persistentData));
    }
  }, [persistentData]);

  // Calculate monthly analytics data with persistence
  const getMonthlyAnalytics = (): MonthlyAnalytics => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    // Current month metrics
    const currentMonthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= currentMonthStart && sessionDate <= currentMonthEnd;
    });

    const currentMonth: MonthlyMetrics = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      monthName: format(now, 'MMMM'),
      revenue: currentMonthSessions.reduce((sum, s) => sum + s.totalCost, 0),
      sessions: currentMonthSessions.length,
      hours: currentMonthSessions.reduce((sum, s) => sum + s.hours, 0),
      customers: new Set(currentMonthSessions.map(s => s.customerId)).size,
      averageSessionLength: currentMonthSessions.length > 0 
        ? currentMonthSessions.reduce((sum, s) => sum + s.hours, 0) / currentMonthSessions.length 
        : 0
    };

    // Previous month metrics
    const previousMonthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= previousMonthStart && sessionDate <= previousMonthEnd;
    });

    const previousMonth: MonthlyMetrics = {
      year: previousMonthStart.getFullYear(),
      month: previousMonthStart.getMonth() + 1,
      monthName: format(previousMonthStart, 'MMMM'),
      revenue: previousMonthSessions.reduce((sum, s) => sum + s.totalCost, 0),
      sessions: previousMonthSessions.length,
      hours: previousMonthSessions.reduce((sum, s) => sum + s.hours, 0),
      customers: new Set(previousMonthSessions.map(s => s.customerId)).size,
      averageSessionLength: previousMonthSessions.length > 0 
        ? previousMonthSessions.reduce((sum, s) => sum + s.hours, 0) / previousMonthSessions.length 
        : 0
    };

    // Year to date metrics
    const yearToDateSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= yearStart && sessionDate <= yearEnd;
    });

    const yearToDate = {
      totalRevenue: yearToDateSessions.reduce((sum, s) => sum + s.totalCost, 0),
      totalSessions: yearToDateSessions.length,
      totalHours: yearToDateSessions.reduce((sum, s) => sum + s.hours, 0),
      totalCustomers: new Set(yearToDateSessions.map(s => s.customerId)).size
    };

    // Monthly trends (last 12 months) - combine live data with persistent data
    const monthlyTrends: MonthlyMetrics[] = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      // Check if we have persistent data for this month
      const persistentMonth = persistentData.find(p => 
        p.year === monthStart.getFullYear() && p.month === monthStart.getMonth() + 1
      );
      
      if (persistentMonth) {
        monthlyTrends.push(persistentMonth);
      } else {
        // Calculate from live sessions if no persistent data
        const monthSessions = sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= monthStart && sessionDate <= monthEnd;
        });

        monthlyTrends.push({
          year: monthStart.getFullYear(),
          month: monthStart.getMonth() + 1,
          monthName: format(monthStart, 'MMM yyyy'),
          revenue: monthSessions.reduce((sum, s) => sum + s.totalCost, 0),
          sessions: monthSessions.length,
          hours: monthSessions.reduce((sum, s) => sum + s.hours, 0),
          customers: new Set(monthSessions.map(s => s.customerId)).size,
          averageSessionLength: monthSessions.length > 0 
            ? monthSessions.reduce((sum, s) => sum + s.hours, 0) / monthSessions.length 
            : 0
        });
      }
    }

    return {
      currentMonth,
      previousMonth,
      monthlyTrends: monthlyTrends.reverse(), // Show oldest to newest
      yearToDate
    };
  };

  // Update persistent data with current month - use useCallback to prevent infinite loops
  const updatePersistentData = React.useCallback((currentMonth: MonthlyMetrics) => {
    setPersistentData(prevData => {
      const existingMonthIndex = prevData.findIndex(p => 
        p.year === currentMonth.year && p.month === currentMonth.month
      );
      
      if (existingMonthIndex >= 0) {
        // Update existing month data
        const updatedData = [...prevData];
        updatedData[existingMonthIndex] = currentMonth;
        return updatedData;
      } else {
        // Add new month data
        return [...prevData, currentMonth];
      }
    });
  }, []);

  // Update persistent data when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      
      const currentMonthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= currentMonthStart && sessionDate <= currentMonthEnd;
      });

      const currentMonth: MonthlyMetrics = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        monthName: format(now, 'MMMM'),
        revenue: currentMonthSessions.reduce((sum, s) => sum + s.totalCost, 0),
        sessions: currentMonthSessions.length,
        hours: currentMonthSessions.reduce((sum, s) => sum + s.hours, 0),
        customers: new Set(currentMonthSessions.map(s => s.customerId)).size,
        averageSessionLength: currentMonthSessions.length > 0 
          ? currentMonthSessions.reduce((sum, s) => sum + s.hours, 0) / currentMonthSessions.length 
          : 0
      };

      updatePersistentData(currentMonth);
    }
  }, [sessions, updatePersistentData]);

  // Calculate analytics data for selected time range
  const getAnalyticsData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });

    const totalRevenue = filteredSessions.reduce((sum, session) => sum + session.totalCost, 0);
    const totalSessions = filteredSessions.length;
    const totalHours = filteredSessions.reduce((sum, session) => sum + session.hours, 0);
    const activeCustomers = new Set(filteredSessions.map(s => s.customerId)).size;

    return {
      totalRevenue,
      totalSessions,
      totalHours,
      activeCustomers,
      filteredSessions
    };
  };

  const getTopCustomers = () => {
    const customerStats = customers.map(customer => {
      const customerSessions = sessions.filter(s => s.customerId === customer.id);
      const totalSpent = customerSessions.reduce((sum, s) => sum + s.totalCost, 0);
      const totalHours = customerSessions.reduce((sum, s) => sum + s.hours, 0);
      
      return {
        id: customer.id,
        name: customer.name,
        totalSessions: customerSessions.length,
        totalSpent,
        totalHours,
        averageSessionLength: customerSessions.length > 0 ? totalHours / customerSessions.length : 0
      };
    });

    return customerStats
      .filter(c => c.totalSessions > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  const getRevenueTrend = () => {
    const now = new Date();
    let intervals: Date[];

    switch (timeRange) {
      case 'day':
        intervals = eachDayOfInterval({
          start: startOfDay(now),
          end: endOfDay(now)
        });
        break;
      case 'week':
        intervals = eachDayOfInterval({
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        });
        break;
      case 'month':
        intervals = eachDayOfInterval({
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
        break;
      case 'year':
        intervals = eachMonthOfInterval({
          start: startOfYear(now),
          end: endOfYear(now)
        });
        break;
    }

    return intervals.map(date => {
      let daySessions: Session[];
      
      if (timeRange === 'year') {
        // For year view, group by month
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        daySessions = sessions.filter(s => {
          const sessionDate = new Date(s.startTime);
          return sessionDate >= monthStart && sessionDate <= monthEnd;
        });
      } else {
        // For other views, group by day
        daySessions = sessions.filter(s => {
          const sessionDate = new Date(s.startTime);
          return sessionDate >= startOfDay(date) && sessionDate <= endOfDay(date);
        });
      }

      return {
        date: timeRange === 'year' ? format(date, 'MMM') : format(date, timeRange === 'day' ? 'HH:mm' : 'MMM dd'),
        revenue: daySessions.reduce((sum, s) => sum + s.totalCost, 0),
        sessions: daySessions.length,
        hours: daySessions.reduce((sum, s) => sum + s.hours, 0)
      };
    });
  };

  const analytics = getAnalyticsData();
  const monthlyAnalytics = getMonthlyAnalytics();
  const topCustomers = getTopCustomers();
  const revenueTrend = getRevenueTrend();
  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">📊</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Analytics Dashboard
            </h2>
            <p className="text-void-800 dark:text-neon-bright/80 font-arcade">
              Real-time insights and performance metrics
            </p>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2 bg-light-100 dark:bg-void-800 rounded-xl p-1 border-2 border-void-300 dark:border-neon-bright/50">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-arcade font-bold transition-all duration-300 ${
                timeRange === range
                  ? 'bg-neon-bright text-void-1000 shadow-neon'
                  : 'text-void-700 dark:text-neon-bright/70 hover:text-gold-bright'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Overview Section */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-gold-bright p-8">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          📅 Monthly Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <p className="text-neon-bright/80 font-arcade text-sm">Current Month</p>
            <p className="text-2xl font-arcade font-black text-gold-bright">
              {monthlyAnalytics.currentMonth.monthName}
            </p>
            <p className="text-3xl font-arcade font-black text-neon-bright">
              {monthlyAnalytics.currentMonth.revenue} SAR
            </p>
            <p className="text-lg font-arcade text-success-400">
              {monthlyAnalytics.currentMonth.hours.toFixed(1)}h
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-neon-bright/80 font-arcade text-sm">Previous Month</p>
            <p className="text-2xl font-arcade font-black text-gold-bright">
              {monthlyAnalytics.previousMonth.monthName}
            </p>
            <p className="text-3xl font-arcade font-black text-neon-bright">
              {monthlyAnalytics.previousMonth.revenue} SAR
            </p>
            <p className="text-lg font-arcade text-success-400">
              {monthlyAnalytics.previousMonth.hours.toFixed(1)}h
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-neon-bright/80 font-arcade text-sm">Year to Date</p>
            <p className="text-2xl font-arcade font-black text-gold-bright">
              {now.getFullYear()}
            </p>
            <p className="text-3xl font-arcade font-black text-neon-bright">
              {monthlyAnalytics.yearToDate.totalRevenue} SAR
            </p>
            <p className="text-lg font-arcade text-success-400">
              {monthlyAnalytics.yearToDate.totalHours.toFixed(1)}h
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-neon-bright/80 font-arcade text-sm">Monthly Growth</p>
            <p className="text-2xl font-arcade font-black text-gold-bright">
              {monthlyAnalytics.previousMonth.revenue > 0 
                ? (((monthlyAnalytics.currentMonth.revenue - monthlyAnalytics.previousMonth.revenue) / monthlyAnalytics.previousMonth.revenue) * 100).toFixed(1)
                : '0'
              }%
            </p>
            <p className={`text-lg font-arcade ${
              monthlyAnalytics.currentMonth.revenue >= monthlyAnalytics.previousMonth.revenue 
                ? 'text-success-400' 
                : 'text-danger-400'
            }`}>
              {monthlyAnalytics.currentMonth.revenue >= monthlyAnalytics.previousMonth.revenue ? '↗️' : '↘️'}
            </p>
          </div>
        </div>

        {/* Monthly Trends Chart with Hours */}
        <div className="bg-void-800/50 rounded-2xl p-6">
          <h4 className="text-xl font-arcade font-bold text-neon-bright mb-4">
            📈 Monthly Trends (Last 12 Months) - Revenue & Hours
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {monthlyAnalytics.monthlyTrends.map((month) => (
              <div key={`${month.year}-${month.month}`} className="text-center p-3 bg-void-700/50 rounded-lg">
                <p className="text-sm font-arcade text-neon-bright/80">{month.monthName}</p>
                <p className="text-lg font-arcade font-bold text-gold-bright">{month.revenue} SAR</p>
                <p className="text-sm font-arcade text-success-400">{month.hours.toFixed(1)}h</p>
                <p className="text-xs font-arcade text-neon-bright/60">{month.sessions} sessions</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-gold-bright/50 dark:border-gold-bright p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Total Revenue</p>
              <p className="text-3xl font-arcade font-black text-gold-bright">
                {analytics.totalRevenue} SAR
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-neon-bright/50 dark:border-neon-bright p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Total Sessions</p>
              <p className="text-3xl font-arcade font-black text-neon-bright">
                {analytics.totalSessions}
              </p>
            </div>
            <span className="text-4xl">🎮</span>
          </div>
        </div>

        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-success-500/50 dark:border-success-500 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Total Hours</p>
              <p className="text-3xl font-arcade font-black text-success-500">
                {analytics.totalHours}h
              </p>
            </div>
            <span className="text-4xl">⏱️</span>
          </div>
        </div>

        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-warning-500/50 dark:border-warning-500 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Active Customers</p>
              <p className="text-3xl font-arcade font-black text-warning-500">
                {analytics.activeCustomers}
              </p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>
      </div>

      {/* Revenue & Hours Trend Chart */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          {selectedMetric === 'revenue' ? '💰 Revenue' : 
           selectedMetric === 'sessions' ? '🎮 Sessions' : 
           selectedMetric === 'customers' ? '👥 Customers' : '⏱️ Hours'} Trend - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
        </h3>
        
        {/* Metric Selector */}
        <div className="flex space-x-2 mb-6">
          {(['revenue', 'sessions', 'customers', 'hours'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg font-arcade font-bold transition-all duration-300 ${
                selectedMetric === metric
                  ? 'bg-neon-bright text-void-1000 shadow-neon'
                  : 'text-void-700 dark:text-neon-bright/70 hover:text-gold-bright'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {revenueTrend.map((data, index) => {
            const maxValue = Math.max(...revenueTrend.map(d => 
              selectedMetric === 'revenue' ? d.revenue : 
              selectedMetric === 'sessions' ? d.sessions : 
              selectedMetric === 'customers' ? 1 : d.hours || 0
            ));
            const currentValue = selectedMetric === 'revenue' ? data.revenue : 
                               selectedMetric === 'sessions' ? data.sessions : 
                               selectedMetric === 'customers' ? 1 : data.hours || 0;
            const height = maxValue > 0 ? (currentValue / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-neon-bright to-neon-glow rounded-t-lg transition-all duration-300 hover:scale-105"
                     style={{ height: `${height}%`, minHeight: '20px' }}>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-xs">
                    {data.date}
                  </p>
                  <p className="text-void-800 dark:text-neon-bright font-arcade font-bold text-sm">
                    {selectedMetric === 'revenue' ? `${data.revenue} SAR` : 
                     selectedMetric === 'sessions' ? data.sessions : 
                     selectedMetric === 'customers' ? '1' : `${data.hours || 0}h`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-gold-bright/50 dark:border-gold-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Top Customers by Revenue
        </h3>
        
        <div className="space-y-4">
          {topCustomers.map((customer, index) => (
            <div key={customer.id} className="flex items-center justify-between p-4 bg-light-200 dark:bg-void-800/50 rounded-xl border border-void-300 dark:border-neon-bright/30 transition-colors duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-bright to-gold-neon rounded-full flex items-center justify-center text-void-1000 font-arcade font-black text-lg">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-arcade font-bold text-void-900 dark:text-white text-lg">
                    {customer.name}
                  </p>
                  <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">
                    {customer.totalSessions} sessions • {customer.totalHours}h
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-arcade font-black text-gold-bright text-xl">
                  {customer.totalSpent} SAR
                </p>
                <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">
                  Avg: {customer.averageSessionLength.toFixed(1)}h
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Distribution */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Session Distribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-light-200 dark:bg-void-800/50 rounded-2xl border border-void-300 dark:border-neon-bright/30">
            <span className="text-5xl mb-4 block">🎯</span>
            <p className="font-arcade font-bold text-void-900 dark:text-white text-xl">
              {sessions.filter(s => s.status === 'active').length}
            </p>
            <p className="text-void-700 dark:text-neon-bright/70 font-arcade">Active Sessions</p>
          </div>
          
          <div className="text-center p-6 bg-light-200 dark:bg-void-800/50 rounded-2xl border border-void-300 dark:border-neon-bright/30">
            <span className="text-5xl mb-4 block">✅</span>
            <p className="font-arcade font-bold text-void-900 dark:text-white text-xl">
              {sessions.filter(s => s.status === 'completed').length}
            </p>
            <p className="text-void-700 dark:text-neon-bright/70 font-arcade">Completed</p>
          </div>
          
          <div className="text-center p-6 bg-light-200 dark:bg-void-800/50 rounded-2xl border border-void-300 dark:border-neon-bright/30">
            <span className="text-5xl mb-4 block">❌</span>
            <p className="font-arcade font-bold text-void-900 dark:text-white text-xl">
              {sessions.filter(s => s.status === 'cancelled').length}
            </p>
            <p className="text-void-700 dark:text-neon-bright/70 font-arcade">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
