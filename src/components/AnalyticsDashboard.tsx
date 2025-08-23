import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { User, Customer, Session, RevenueData, CustomerStats } from '../types';

interface AnalyticsDashboardProps {
  customers: Customer[];
  sessions: Session[];
  user: User;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ customers, sessions, user }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'sessions' | 'customers'>('revenue');

  // Calculate analytics data
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
    }

    return intervals.map(date => {
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= startOfDay(date) && sessionDate <= endOfDay(date);
      });

      return {
        date: format(date, timeRange === 'day' ? 'HH:mm' : 'MMM dd'),
        revenue: daySessions.reduce((sum, s) => sum + s.totalCost, 0),
        sessions: daySessions.length
      };
    });
  };

  const analytics = getAnalyticsData();
  const topCustomers = getTopCustomers();
  const revenueTrend = getRevenueTrend();

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
          {(['day', 'week', 'month'] as const).map((range) => (
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

      {/* Revenue Trend Chart */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Revenue Trend - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
        </h3>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {revenueTrend.map((data, index) => {
            const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue));
            const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
            
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
                    {data.revenue} SAR
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
