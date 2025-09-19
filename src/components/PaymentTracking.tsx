import React, { useState, useEffect } from 'react';
import ModalPortal from './ModalPortal';
import { format } from 'date-fns';
import { Payment, Session, Customer } from '../types';

interface PaymentTrackingProps {
  payments: Payment[];
  sessions: Session[];
  customers: Customer[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onUpdatePayment: (paymentId: string, updates: Partial<Payment>) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ 
  payments, 
  sessions, 
  customers, 
  onAddPayment, 
  onUpdatePayment
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'online', label: 'Online', icon: '🌐' },
    { value: 'mixed', label: 'Mixed', icon: '💰' }
  ];

  const paymentStatuses = [
    { value: 'completed', label: 'Completed', icon: '✅', color: 'success' }
  ];


  const filteredPayments = payments.filter(payment => {
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesMethod = selectedMethod === 'all' || payment.method === selectedMethod;
    return matchesStatus && matchesMethod;
  });

  const getCustomerName = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return 'Unknown Session';
    const customer = customers.find(c => c.id === session.customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getSessionDetails = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return { gameType: 'Unknown', duration: 0 };
    return {
      gameType: 'Session',
      duration: session.hours
    };
  };

  const getPaymentStats = () => {
    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const failedPayments = payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;

    return { totalRevenue, pendingPayments, failedPayments, totalPayments };
  };

  const getMethodStats = () => {
    const totals: Record<string, { count: number; amount: number }> = {
      cash: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      online: { count: 0, amount: 0 },
      mixed: { count: 0, amount: 0 }
    };

    for (const p of payments) {
      if (p.method === 'mixed') {
        // Mixed counts as one mixed payment
        totals.mixed.count += 1;
        if (p.status === 'completed') totals.mixed.amount += p.amount;

        // Also distribute its components to cash/card/online
        if ((p.cashAmount || 0) > 0) {
          totals.cash.count += 1;
          if (p.status === 'completed') totals.cash.amount += p.cashAmount || 0;
        }
        if ((p.cardAmount || 0) > 0) {
          totals.card.count += 1;
          if (p.status === 'completed') totals.card.amount += p.cardAmount || 0;
        }
        if ((p.onlineAmount || 0) > 0) {
          totals.online.count += 1;
          if (p.status === 'completed') totals.online.amount += p.onlineAmount || 0;
        }
      } else {
        totals[p.method].count += 1;
        if (p.status === 'completed') totals[p.method].amount += p.amount;
      }
    }

    return paymentMethods.map(m => ({
      ...m,
      count: totals[m.value].count,
      amount: totals[m.value].amount
    }));
  };

  const stats = getPaymentStats();
  const methodStats = getMethodStats();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">💰</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Session Payment Records
            </h2>
            <p className="text-void-800 dark:text-neon-bright/80 font-arcade">
              View payment records automatically generated from completed sessions
            </p>
          </div>
        </div>
        <div className="px-6 py-3 bg-void-800/50 text-neon-bright font-arcade font-bold rounded-xl border-2 border-neon-bright/30 flex items-center space-x-2">
          <span className="text-xl">📊</span>
          <span>SESSION PAYMENT RECORDS</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-gold-bright/50 dark:border-gold-bright p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Total Revenue</p>
              <p className="text-3xl font-arcade font-black text-gold-bright">
                {stats.totalRevenue} SAR
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-warning-500/50 dark:border-warning-500 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Pending</p>
              <p className="text-3xl font-arcade font-black text-warning-500">
                {stats.pendingPayments} SAR
              </p>
            </div>
            <span className="text-4xl">⏳</span>
          </div>
        </div>

        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-danger-500/50 dark:border-danger-500 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Failed</p>
              <p className="text-3xl font-arcade font-black text-danger-500">
                {stats.failedPayments} SAR
              </p>
            </div>
            <span className="text-4xl">❌</span>
          </div>
        </div>

        <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 border-neon-bright/50 dark:border-neon-bright p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">Total Payments</p>
              <p className="text-3xl font-arcade font-black text-neon-bright">
                {stats.totalPayments}
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Payment Methods Distribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {methodStats.map((method) => (
            <div key={method.value} className="text-center p-6 bg-light-200 dark:bg-void-800/50 rounded-2xl border border-void-300 dark:border-neon-bright/30">
              <span className="text-5xl mb-4 block">{method.icon}</span>
              <p className="font-arcade font-bold text-void-900 dark:text-white text-xl mb-2">
                {method.count}
              </p>
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm mb-2">
                {method.label} Payments
              </p>
              <p className="font-arcade font-black text-gold-bright text-lg">
                {method.amount} SAR
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-6 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
            >
              <option value="all">All Statuses</option>
              {paymentStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Method Filter
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
            >
              <option value="all">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.icon} {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Payment History
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-neon-bright/30">
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Customer</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Session</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Amount</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Method</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Status</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => {
                const sessionDetails = getSessionDetails(payment.sessionId);
                const customerName = getCustomerName(payment.sessionId);
                const methodInfo = paymentMethods.find(m => m.value === payment.method);
                const statusInfo = paymentStatuses.find(s => s.value === payment.status);
                
                return (
                  <tr 
                    key={payment.id}
                    className="border-b border-neon-bright/20 hover:bg-light-200 dark:hover:bg-void-800/50 transition-colors duration-300"
                  >
                    <td className="py-4 px-4">
                      <div className="font-arcade font-bold text-void-900 dark:text-white">
                        {customerName}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">
                        {sessionDetails.gameType}
                      </div>
                      <div className="text-void-800 dark:text-neon-bright font-arcade text-xs">
                        {sessionDetails.duration}h
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-arcade font-black text-gold-bright text-lg">
                        {payment.amount} SAR
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full font-arcade font-bold text-sm border ${
                        methodInfo?.value === 'cash' ? 'bg-success-500/20 text-success-400 border-success-500' :
                        methodInfo?.value === 'card' ? 'bg-blue-500/20 text-blue-400 border-blue-500' :
                        methodInfo?.value === 'online' ? 'bg-warning-500/20 text-warning-400 border-warning-500' :
                        'bg-neon-bright/20 text-neon-bright border-neon-bright'
                      }`}>
                        {methodInfo?.icon} {methodInfo?.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full font-arcade font-bold text-sm border ${
                        statusInfo?.value === 'completed' ? 'bg-success-500/20 text-success-400 border-success-500' :
                        statusInfo?.value === 'pending' ? 'bg-warning-500/20 text-warning-400 border-warning-500' :
                        'bg-danger-500/20 text-danger-400 border-danger-500'
                      }`}>
                        {statusInfo?.icon} {statusInfo?.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">
                        {format(new Date(payment.createdAt), 'MMM dd, HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-center">
                        <span className="text-green-400 font-arcade text-sm">
                          ✅ Completed
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">💰</div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
              No payments found
            </h3>
            <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-lg mb-8">
              {selectedStatus !== 'all' || selectedMethod !== 'all' 
                ? 'Try adjusting your filters'
                : 'Payment records will appear here automatically when sessions are completed!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking;
