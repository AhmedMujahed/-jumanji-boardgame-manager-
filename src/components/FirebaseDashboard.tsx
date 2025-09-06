import React, { useState, useEffect } from 'react';
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
import { User } from '../types';
import Promotions from './Promotions';

// Firebase hooks
import {
  useCustomers,
  useSessions,
  useGames,
  usePayments,
  usePromotions,
  useTables,
  useActivityLogs,
  useBroadcasts
} from '../hooks/useFirebaseRealtime';

interface FirebaseDashboardProps {
  user: User;
  onLogout: () => void;
}

const FirebaseDashboard: React.FC<FirebaseDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Firebase real-time hooks
  const { customers, loading: customersLoading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { sessions, activeSessions, loading: sessionsLoading, startSession, endSession, updateSession } = useSessions();
  const { games, loading: gamesLoading, addGame, updateGame, deleteGame } = useGames();
  const { payments, loading: paymentsLoading, addPayment, updatePayment } = usePayments();
  const { promotions, loading: promotionsLoading, addPromotion, updatePromotion, deletePromotion } = usePromotions();
  const { tables, loading: tablesLoading, updateTable, addTable } = useTables();
  const { logs, loading: logsLoading, addLog } = useActivityLogs(50);
  const { lastBroadcast, broadcast } = useBroadcasts();

  // Loading state
  const isLoading = customersLoading || sessionsLoading || gamesLoading || 
                   paymentsLoading || promotionsLoading || tablesLoading || logsLoading;

  // Handle real-time broadcasts
  useEffect(() => {
    if (lastBroadcast) {
      console.log('Received broadcast:', lastBroadcast);
      // You can handle different broadcast types here
      // For example, show notifications, update UI, etc.
    }
  }, [lastBroadcast]);

  const getRoleDisplayName = (role: string) => {
    return role === 'owner' ? 'Owner' : 'Game Master';
  };

  // Check permissions
  const hasLogsAccess = user.role === 'owner';
  const hasAnalyticsAccess = user.role === 'owner';

  // Enhanced handlers with Firebase integration and broadcasting
  const handleAddCustomer = async (customerData: any) => {
    try {
      const id = await addCustomer(customerData);
      await addLog({
        type: 'customer_add',
        userId: user.id,
        userName: user.username,
        userRole: user.role,
        action: 'Added new customer',
        details: `Added customer: ${customerData.name}`,
        timestamp: new Date().toISOString()
      });
      await broadcast('customer:update', { action: 'add', customerId: id });
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleUpdateCustomer = async (customerId: string, updates: any) => {
    try {
      await updateCustomer(customerId, updates);
      await addLog({
        type: 'customer_edit',
        userId: user.id,
        userName: user.username,
        userRole: user.role,
        action: 'Updated customer',
        details: `Updated customer: ${customerId}`,
        timestamp: new Date().toISOString()
      });
      await broadcast('customer:update', { action: 'update', customerId });
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
      await addLog({
        type: 'customer_delete',
        userId: user.id,
        userName: user.username,
        userRole: user.role,
        action: 'Deleted customer',
        details: `Deleted customer: ${customerId}`,
        timestamp: new Date().toISOString()
      });
      await broadcast('customer:update', { action: 'delete', customerId });
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleStartSession = async (sessionData: any) => {
    try {
      const sessionId = await startSession({
        ...sessionData,
        startTime: new Date().toISOString(),
        status: 'active',
        hours: 0,
        totalCost: 0,
        gameMasterId: user.id
      });
      await broadcast('session:update', { action: 'start', sessionId });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        const endTime = new Date().toISOString();
        const startTime = new Date(session.startTime);
        const endTimeDate = new Date(endTime);
        const hours = Math.ceil((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60 * 60));
        const totalCost = hours * 30; // 30 SAR per hour

        await endSession(sessionId, endTime, totalCost);
        await broadcast('session:update', { action: 'end', sessionId });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: any) => {
    try {
      await updateSession(sessionId, updates);
      await broadcast('session:update', { action: 'update', sessionId });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleAddGame = async (gameData: any) => {
    try {
      const gameId = await addGame(gameData);
      await addLog({
        type: 'game_add',
        userId: user.id,
        userName: user.username,
        userRole: user.role,
        action: 'Added new game',
        details: `Added game: ${gameData.name}`,
        timestamp: new Date().toISOString()
      });
      await broadcast('game:update', { action: 'add', gameId });
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const handleUpdateGame = async (gameId: string, updates: any) => {
    try {
      await updateGame(gameId, updates);
      await broadcast('game:update', { action: 'update', gameId });
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteGame(gameId);
      await broadcast('game:update', { action: 'delete', gameId });
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const handleAddPayment = async (paymentData: any) => {
    try {
      const paymentId = await addPayment(paymentData);
      await broadcast('payment:update', { action: 'add', paymentId });
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleUpdatePayment = async (paymentId: string, updates: any) => {
    try {
      await updatePayment(paymentId, updates);
      await broadcast('payment:update', { action: 'update', paymentId });
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleTableStatusChange = async (tableId: string, status: any) => {
    try {
      await updateTable(tableId, { status });
      await broadcast('table:update', { action: 'status_change', tableId, status });
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const handleClearAllLogs = async () => {
    // Note: This would require a custom implementation since we can't delete all records easily
    console.log('Clear all logs - would need custom implementation');
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-bright mx-auto mb-4"></div>
            <p className="text-neon-bright text-xl font-arcade">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <Overview customers={customers} sessions={sessions} payments={payments} user={user} />;
      case 'customers':
        return (
          <CustomerManagement 
            customers={customers} 
            onAddCustomer={handleAddCustomer} 
            user={user} 
            onUpdateCustomer={handleUpdateCustomer} 
            onDeleteCustomer={handleDeleteCustomer} 
          />
        );
      case 'sessions':
        return (
          <SessionManagement 
            customers={customers} 
            sessions={sessions} 
            tables={tables} 
            promotions={promotions || []} 
            onAddSession={handleStartSession} 
            onUpdateSession={handleUpdateSession} 
            onEndSession={handleEndSession} 
            user={user} 
          />
        );
      case 'analytics':
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
            </div>
          );
        }
        return <AnalyticsDashboard customers={customers} sessions={sessions} user={user} />;
      case 'games':
        return (
          <GameLibrary 
            games={games} 
            onAddGame={handleAddGame} 
            onUpdateGame={handleUpdateGame} 
            onDeleteGame={handleDeleteGame} 
          />
        );
      case 'promotions':
        return (
          <Promotions 
            promotions={promotions || []} 
            onAddPromotion={addPromotion} 
            onUpdatePromotion={updatePromotion} 
            onDeletePromotion={deletePromotion} 
          />
        );
      case 'payments':
        return (
          <PaymentTracking 
            payments={payments} 
            sessions={sessions} 
            customers={customers} 
            onAddPayment={handleAddPayment} 
            onUpdatePayment={handleUpdatePayment} 
            onDeletePayment={() => {}} // Not implemented yet
          />
        );
      case 'tables':
        return (
          <TableManagement 
            tables={tables} 
            reservations={[]} // Reservations not loaded in this example
            customers={customers} 
            sessions={sessions} 
            onAddTable={addTable} 
            onUpdateTable={updateTable} 
            onDeleteTable={() => {}} // Not implemented yet
            onTableStatusChange={handleTableStatusChange} 
            onAddReservation={() => {}} // Not implemented yet
            onUpdateReservation={() => {}} // Not implemented yet
            onDeleteReservation={() => {}} // Not implemented yet
            onRefreshTables={() => {}} // Not needed with real-time updates
          />
        );
      case 'logs':
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
            </div>
          );
        }
        return (
          <ActivityLogComponent 
            logs={logs} 
            user={user} 
            onClearAllLogs={handleClearAllLogs} 
          />
        );
      default:
        return <Overview customers={customers} sessions={sessions} payments={payments} user={user} />;
    }
  };

  const getFilteredTabs = () => {
    const allTabs = [
      { id: 'overview', label: '🎲 Overview', icon: '🎲' },
      { id: 'customers', label: '👥 Customers', icon: '🎯' },
      { id: 'sessions', label: '⏱️ Sessions', icon: '🎮' },
      { id: 'promotions', label: '🏷️ Promotions', icon: '🏷️' },
      { id: 'analytics', label: '📊 Analytics', icon: '📊' },
      { id: 'games', label: '🎲 Games', icon: '🎲' },
      { id: 'payments', label: '💰 Payments', icon: '💰' },
      { id: 'tables', label: '🏠 Tables', icon: '🏠' },
      { id: 'logs', label: '📋 Activity Log', icon: '📋' }
    ];

    return allTabs.filter(tab => 
      (tab.id !== 'analytics' || hasAnalyticsAccess) && 
      (tab.id !== 'logs' || hasLogsAccess)
    );
  };

  const tabs = getFilteredTabs();

  // Redirect if accessing restricted tabs
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
          
          {/* Firebase Status Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-neon-bright font-arcade text-sm">
              Firebase Real-time Connected
            </span>
          </div>
        </div>

        {/* Active Sessions Alert */}
        {activeSessions.length > 0 && (
          <div className="bg-gradient-to-r from-gold-bright/20 to-neon-bright/20 border-2 border-gold-bright rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">⚡</span>
              <span className="text-gold-bright font-arcade font-bold">
                {activeSessions.length} Active Session{activeSessions.length !== 1 ? 's' : ''} Running
              </span>
            </div>
          </div>
        )}

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

export default FirebaseDashboard;
