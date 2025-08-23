import React, { useState } from 'react';
import CustomerManagement from './CustomerManagement';
import SessionManagement from './SessionManagement';
import Overview from './Overview';
import AnalyticsDashboard from './AnalyticsDashboard';
import GameLibrary from './GameLibrary';
import PaymentTracking from './PaymentTracking';
import TableManagement from './TableManagement';
import ActivityLogComponent from './ActivityLog';
import JumanjiHeader from './JumanjiHeader';
import JumanjiButton from './JumanjiButton';
import { User, Customer, Session, Game, Payment, Table, Reservation, ActivityLog } from '../types';

interface DashboardProps {
  user: User;
  customers: Customer[];
  sessions: Session[];
  games: Game[];
  payments: Payment[];
  tables: Table[];
  reservations: Reservation[];
  logs: ActivityLog[];
  onLogout: () => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onAddSession: (session: Omit<Session, 'id' | 'startTime' | 'status' | 'totalCost' | 'hours'>) => void;
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
  onEndSession: (sessionId: string) => void;
  onAddGame: (game: Omit<Game, 'id'>) => void;
  onUpdateGame: (gameId: string, updates: Partial<Game>) => void;
  onDeleteGame: (gameId: string) => void;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onUpdatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  onDeletePayment: (paymentId: string) => void;
  onAddTable: (table: Omit<Table, 'id'>) => void;
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void;
  onDeleteTable: (tableId: string) => void;
  onTableStatusChange: (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'maintenance') => void;
  onAddReservation: (reservation: Omit<Reservation, 'id'>) => void;
  onUpdateReservation: (reservationId: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (reservationId: string) => void;
  onRefreshTables?: () => void;
  onClearAllLogs: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  customers, 
  sessions, 
  games,
  payments,
  tables,
  reservations,
  logs,
  onLogout, 
  onAddCustomer, 
  onAddSession, 
  onUpdateSession, 
  onEndSession,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onTableStatusChange,
  onAddReservation,
  onUpdateReservation,
  onDeleteReservation,
  onRefreshTables,
  onClearAllLogs
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getRoleDisplayName = (role: string) => {
    return role === 'owner' ? 'Owner' : 'Game Master';
  };

  // Check if user has access to activity logs
  const hasLogsAccess = user.role === 'owner';
  
  // Check if user has access to analytics
  const hasAnalyticsAccess = user.role === 'owner';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview customers={customers} sessions={sessions} user={user} />;
      case 'customers':
        return <CustomerManagement customers={customers} onAddCustomer={onAddCustomer} user={user} />;
      case 'sessions':
        return <SessionManagement customers={customers} sessions={sessions} tables={tables} onAddSession={onAddSession} onUpdateSession={onUpdateSession} onEndSession={onEndSession} user={user} />;
      case 'analytics':
        // Only allow access to analytics for owner role
        if (!hasAnalyticsAccess) {
          return (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-arcade font-bold text-gold-bright mb-4">
                Access Restricted
              </h3>
              <p className="text-neon-bright text-lg font-arcade">
                Analytics are only available to owners.
              </p>
              <p className="text-neon-bright/80 text-md font-arcade mt-2">
                Please contact an owner if you need access to this information.
              </p>
            </div>
          );
        }
        return <AnalyticsDashboard customers={customers} sessions={sessions} user={user} />;
      case 'games':
        return <GameLibrary games={games} onAddGame={onAddGame} onUpdateGame={onUpdateGame} onDeleteGame={onDeleteGame} />;
      case 'payments':
        return <PaymentTracking payments={payments} sessions={sessions} customers={customers} onAddPayment={onAddPayment} onUpdatePayment={onUpdatePayment} onDeletePayment={onDeletePayment} />;
      case 'tables':
        return <TableManagement tables={tables} reservations={reservations} customers={customers} sessions={sessions} onAddTable={onAddTable} onUpdateTable={onUpdateTable} onDeleteTable={onDeleteTable} onTableStatusChange={onTableStatusChange} onAddReservation={onAddReservation} onUpdateReservation={onUpdateReservation} onDeleteReservation={onDeleteReservation} onRefreshTables={onRefreshTables} />;
      case 'logs':
        // Only allow access to logs for owner role
        if (!hasLogsAccess) {
          return (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-arcade font-bold text-gold-bright mb-4">
                Access Restricted
              </h3>
              <p className="text-neon-bright text-lg font-arcade">
                Activity logs are only available to owners.
              </p>
              <p className="text-neon-bright/80 text-md font-arcade mt-2">
                Please contact an owner if you need access to this information.
              </p>
            </div>
          );
        }
        return <ActivityLogComponent logs={logs} user={user} onClearAllLogs={onClearAllLogs} />;
      default:
        return <Overview customers={customers} sessions={sessions} user={user} />;
    }
  };

  // Filter tabs based on user role
  const getFilteredTabs = () => {
    const allTabs = [
      { id: 'overview', label: '🎲 Overview', icon: '🎲' },
      { id: 'customers', label: '👥 Customers', icon: '🎯' },
      { id: 'sessions', label: '⏱️ Sessions', icon: '🎮' },
      { id: 'analytics', label: '📊 Analytics', icon: '📊' },
      { id: 'games', label: '🎲 Games', icon: '🎲' },
      { id: 'payments', label: '💰 Payments', icon: '💰' },
      { id: 'tables', label: '🏠 Tables', icon: '🏠' },
      { id: 'logs', label: '📋 Activity Log', icon: '📋' }
    ];

    // Only show analytics and logs tabs for owners
    return allTabs.filter(tab => 
      (tab.id !== 'analytics' || hasAnalyticsAccess) && 
      (tab.id !== 'logs' || hasLogsAccess)
    );
  };

  const tabs = getFilteredTabs();

  // If user tries to access restricted tabs without permission, redirect to overview
  React.useEffect(() => {
    if ((activeTab === 'logs' && !hasLogsAccess) || (activeTab === 'analytics' && !hasAnalyticsAccess)) {
      setActiveTab('overview');
    }
  }, [activeTab, hasLogsAccess, hasAnalyticsAccess]);

  return (
    <div className="min-h-screen bg-void-1000 dark:bg-void-1000 bg-light-1000 dark:bg-jumanji-pattern dark:bg-dice-pattern transition-colors duration-300">
      <JumanjiHeader user={user} onLogout={onLogout} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-arcade font-black text-gold-bright mb-3 animate-glow">
            Welcome back, {user.username}! 👋
          </h2>
          <p className="text-void-800 dark:text-neon-bright text-xl font-arcade font-bold transition-colors duration-300">
            You're logged in as a <span className="text-gold-bright font-black">{getRoleDisplayName(user.role)}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright/50 dark:border-neon-bright p-3 mb-8 transition-colors duration-300">
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 rounded-xl font-arcade font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-neon-bright to-neon-glow text-void-1000 shadow-neon-lg transform scale-105'
                    : 'text-void-700 dark:text-neon-bright hover:text-gold-bright hover:bg-light-200 dark:hover:bg-void-800/50 border-2 border-transparent hover:border-neon-bright/50'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
