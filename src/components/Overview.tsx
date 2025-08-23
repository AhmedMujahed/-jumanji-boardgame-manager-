import React from 'react';
import JumanjiStatsCard from './JumanjiStatsCard';
import JumanjiCard from './JumanjiCard';
import { User, Customer, Session } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

interface OverviewProps {
  customers: Customer[];
  sessions: Session[];
  user: User;
}

const Overview: React.FC<OverviewProps> = ({ customers, sessions, user }) => {
  const getRecentSessions = () => {
    return sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
  };

  const getTopCustomers = () => {
    const customerStats: { [key: string]: { customer: Customer; totalSessions: number; totalHours: number; totalSpent: number } } = {};
    
    sessions.forEach(session => {
      const customer = customers.find(c => c.id === session.customerId);
      if (customer) {
        if (!customerStats[customer.id]) {
          customerStats[customer.id] = {
            customer,
            totalSessions: 0,
            totalHours: 0,
            totalSpent: 0
          };
        }
        customerStats[customer.id].totalSessions++;
        customerStats[customer.id].totalHours += session.hours || 0;
        customerStats[customer.id].totalSpent += session.totalCost || 0;
      }
    });

    return Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  // Calculate monthly metrics
  const getMonthlyMetrics = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    });

    const monthlyRevenue = monthlySessions.reduce((sum, session) => sum + (session.totalCost || 0), 0);
    const monthlyHours = monthlySessions.reduce((sum, session) => sum + (session.hours || 0), 0);
    const monthlyActiveSessions = monthlySessions.filter(session => session.status === 'active').length;

    return {
      revenue: monthlyRevenue,
      hours: monthlyHours,
      activeSessions: monthlyActiveSessions
    };
  };

  const monthlyMetrics = getMonthlyMetrics();
  const totalHours = sessions.reduce((sum, session) => sum + (session.hours || 0), 0);
  const activeSessions = sessions.filter(session => session.status === 'active').length;
  const completedSessions = sessions.filter(session => session.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <JumanjiStatsCard
          title="Total Customers"
          value={customers.length.toString()}
          subtitle="Registered players"
          icon="👥"
          color="jumanji"
        />
        <JumanjiStatsCard
          title="Active Sessions"
          value={activeSessions.toString()}
          subtitle="Currently playing"
          icon="⏱️"
          color="jungle"
        />
        <JumanjiStatsCard
          title="Monthly Revenue"
          value={`${monthlyMetrics.revenue.toFixed(0)} SAR`}
          subtitle={`${new Date().toLocaleString('default', { month: 'long' })} earnings`}
          icon="💰"
          color="gold"
        />
        <JumanjiStatsCard
          title="Monthly Hours"
          value={`${monthlyMetrics.hours.toFixed(1)}h`}
          subtitle={`${new Date().toLocaleString('default', { month: 'long' })} gaming time`}
          icon="🎮"
          color="earth"
        />
      </div>

      {/* Recent Sessions */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">📊</span>
          <div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright">
              Recent Sessions
            </h3>
            <p className="text-neon-bright/80 font-arcade">
              Latest gaming activities
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {getRecentSessions().length > 0 ? (
            getRecentSessions().map((session) => {
              const customer = customers.find(c => c.id === session.customerId);
              return (
                <div key={session.id} className="flex items-center justify-between p-6 bg-void-800/80 rounded-2xl border-2 border-neon-bright/50 hover:border-neon-bright transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-bright to-neon-glow rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {customer?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-arcade font-bold text-gold-bright text-lg">
                        {customer?.name || 'Unknown Customer'}
                      </p>
                      <p className="text-neon-bright/80 font-arcade">
                        {new Date(session.startTime).toLocaleDateString()} • {session.hours?.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-arcade font-black text-neon-bright text-xl">
                      {session.totalCost?.toFixed(0)} SAR
                    </p>
                    <span className={`px-3 py-1 text-sm rounded-full font-arcade font-bold ${
                      session.status === 'active' 
                        ? 'bg-success-500/20 text-success-400 border border-success-500'
                        : 'bg-void-700 text-neon-bright/80 border border-neon-bright/50'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-neon-bright/60">
              <div className="text-6xl mb-4">🎲</div>
              <p className="text-xl font-arcade font-bold mb-2">No sessions yet</p>
              <p className="font-arcade">Start your first gaming session!</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-gold-bright p-8">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">🏆</span>
          <div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright">
              Top Customers
            </h3>
            <p className="text-neon-bright/80 font-arcade">
              Highest spending players
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {getTopCustomers().length > 0 ? (
            getTopCustomers().map((stat, index) => (
              <div key={stat.customer.id} className="flex items-center justify-between p-6 bg-void-800/80 rounded-2xl border-2 border-gold-bright/50 hover:border-gold-bright transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold-bright to-gold-neon rounded-full flex items-center justify-center text-void-1000 font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-arcade font-bold text-gold-bright text-lg">
                      {stat.customer.name}
                    </p>
                    <p className="text-neon-bright/80 font-arcade">
                      {stat.totalSessions} sessions • {stat.totalHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-arcade font-black text-gold-bright text-xl">
                    {stat.totalSpent.toFixed(0)} SAR
                  </p>
                  <p className="text-xs text-neon-bright/60 font-arcade">
                    Total spent
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neon-bright/60">
              <div className="text-6xl mb-4">👑</div>
              <p className="text-xl font-arcade font-bold mb-2">No customers yet</p>
              <p className="font-arcade">Add your first customer to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
