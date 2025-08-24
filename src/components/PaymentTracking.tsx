import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Payment, Session, Customer } from '../types';

interface PaymentTrackingProps {
  payments: Payment[];
  sessions: Session[];
  customers: Customer[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onUpdatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  onDeletePayment: (paymentId: string) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ 
  payments, 
  sessions, 
  customers, 
  onAddPayment, 
  onUpdatePayment, 
  onDeletePayment 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [formData, setFormData] = useState({
    sessionId: '',
    amount: 0,
    method: 'cash' as 'cash' | 'card' | 'online' | 'mixed',
    cashAmount: 0,
    cardAmount: 0,
    onlineAmount: 0,
    status: 'pending' as 'pending' | 'completed' | 'failed',
    notes: ''
  });

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'online', label: 'Online', icon: '🌐' },
    { value: 'mixed', label: 'Mixed', icon: '💰' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', icon: '⏳', color: 'warning' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'success' },
    { value: 'failed', label: 'Failed', icon: '❌', color: 'danger' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let totalAmount = formData.amount;
    
    // For mixed payments, calculate total from individual amounts
    if (formData.method === 'mixed') {
      totalAmount = formData.cashAmount + formData.cardAmount + formData.onlineAmount;
    }
    
    // Validate that total amount matches the session cost
    const session = sessions.find(s => s.id === formData.sessionId);
    if (session && Math.abs(totalAmount - session.totalCost) > 0.01) {
      alert(`Payment amount (${totalAmount} SAR) doesn't match session cost (${session.totalCost} SAR)`);
      return;
    }
    
    onAddPayment({
      sessionId: formData.sessionId,
      amount: totalAmount,
      method: formData.method,
      cashAmount: formData.method === 'mixed' ? formData.cashAmount : undefined,
      cardAmount: formData.method === 'mixed' ? formData.cardAmount : undefined,
      onlineAmount: formData.method === 'mixed' ? formData.onlineAmount : undefined,
      status: formData.status,
      notes: formData.notes,
      timestamp: new Date().toISOString()
    });
    
    setFormData({
      sessionId: '',
      amount: 0,
      method: 'cash',
      cashAmount: 0,
      cardAmount: 0,
      onlineAmount: 0,
      status: 'pending',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

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
              Payment Tracking
            </h2>
            <p className="text-void-800 dark:text-neon-bright/80 font-arcade">
              Monitor revenue and payment status
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>ADD PAYMENT</span>
        </button>
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

      {/* Add Payment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-light-100 dark:bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8 w-full max-w-md animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">💰</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Add New Payment
                </h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 bg-light-200 dark:bg-void-800 hover:bg-light-300 dark:hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Session *
                </label>
                <select
                  name="sessionId"
                  value={formData.sessionId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                >
                  <option value="">Select a session</option>
                  {sessions.filter(s => s.status === 'completed').map(session => {
                    const customer = customers.find(c => c.id === session.customerId);
                    return (
                      <option key={session.id} value={session.id}>
                        {customer?.name || 'Unknown'} - Session ({session.hours}h)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Amount (SAR) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Payment Method *
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mixed Payment Fields */}
              {formData.method === 'mixed' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                      Cash Amount
                    </label>
                    <input
                      type="number"
                      name="cashAmount"
                      value={formData.cashAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                      Card Amount
                    </label>
                    <input
                      type="number"
                      name="cardAmount"
                      value={formData.cardAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                      Online Amount
                    </label>
                    <input
                      type="number"
                      name="onlineAmount"
                      value={formData.onlineAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Payment Summary for Mixed */}
              {formData.method === 'mixed' && (
                <div className="p-3 bg-void-700/30 rounded-lg border border-neon-bright/20">
                  <div className="text-center">
                    <div className="text-neon-bright/80 font-arcade text-sm">
                      <strong>💰 Payment Summary:</strong> Total: {formData.cashAmount + formData.cardAmount + formData.onlineAmount} SAR
                    </div>
                    <div className="text-neon-bright/60 font-arcade text-xs mt-1">
                      💵 Cash: {formData.cashAmount} SAR • 💳 Card: {formData.cardAmount} SAR • 🌐 Online: {formData.onlineAmount} SAR
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                >
                  {paymentStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Payment notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-light-300 dark:bg-void-700 hover:bg-light-400 dark:hover:bg-void-600 text-void-800 dark:text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-light-400 dark:border-void-600 hover:border-neon-bright/50"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright"
                >
                  ADD PAYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Actions</th>
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
                        {format(new Date(payment.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onUpdatePayment(payment.id, { 
                            status: payment.status === 'completed' ? 'pending' : 'completed' 
                          })}
                          className={`px-3 py-1 rounded-lg text-xs font-arcade font-bold transition-all duration-300 ${
                            payment.status === 'completed'
                              ? 'bg-warning-600 hover:bg-warning-700 text-white'
                              : 'bg-success-600 hover:bg-success-700 text-white'
                          }`}
                        >
                          {payment.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                        </button>
                        <button 
                          onClick={() => onDeletePayment(payment.id)}
                          className="px-3 py-1 bg-danger-600 hover:bg-danger-700 text-white rounded-lg text-xs font-arcade font-bold transition-all duration-300"
                        >
                          🗑️
                        </button>
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
                : 'Add your first payment to start tracking revenue!'
              }
            </p>
            {selectedStatus === 'all' && selectedMethod === 'all' && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-8 py-4 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-3 mx-auto"
              >
                <span className="text-2xl">💳</span>
                <span>ADD FIRST PAYMENT</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking;
