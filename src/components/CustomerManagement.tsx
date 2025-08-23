import React, { useState } from 'react';
import { format } from 'date-fns';
import { User, Customer } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  user: User;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ 
  customers, 
  onAddCustomer, 
  user 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    totalSessions: 0,
    totalSpent: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim(),
        totalSessions: 0,
        totalSpent: 0
      });
      setFormData({ name: '', phone: '', email: '', notes: '', totalSessions: 0, totalSpent: 0 });
      setShowAddForm(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">👥</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Customer Management
            </h2>
            <p className="text-neon-bright/80 font-arcade">
              Manage your gaming community
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-2"
        >
          <span className="text-xl">🎯</span>
          <span>ADD CUSTOMER</span>
        </button>
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8 w-full max-w-md animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎮</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Add New Customer
                </h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 bg-void-800 hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about the customer"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-void-700 hover:bg-void-600 text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-void-600 hover:border-neon-bright/50"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright"
                >
                  ADD CUSTOMER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8">
        {customers.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-arcade font-bold text-gold-bright">
                Customer Database ({customers.length})
              </h3>
              <div className="text-neon-bright/70 font-arcade text-sm">
                Manage your gaming community
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neon-bright/30">
                    <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Customer</th>
                    <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Contact</th>
                    <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Notes</th>
                    <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Joined</th>
                    <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr 
                      key={customer.id} 
                      className="border-b border-neon-bright/20 hover:bg-void-800/50 transition-colors duration-300"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-bright to-neon-glow rounded-full flex items-center justify-center text-void-1000 font-arcade font-black">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-arcade font-bold text-white text-lg">
                              {customer.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-neon-bright/80 font-arcade text-sm">
                            📞 {customer.phone || '-'}
                          </div>
                          <div className="text-neon-bright/80 font-arcade text-sm">
                            ✉️ {customer.email || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {customer.notes ? (
                          <div 
                            title={customer.notes}
                            className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-neon-bright/70 font-arcade text-sm"
                          >
                            {customer.notes}
                          </div>
                        ) : (
                          <span className="text-neon-bright/40 font-arcade text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-neon-bright/80 font-arcade text-sm">
                          {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-success-500/20 text-success-400 border border-success-500 rounded-full font-arcade font-bold text-sm">
                          {customer.totalSessions || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
              No customers yet
            </h3>
            <p className="text-neon-bright/70 font-arcade text-lg mb-8">
              Add your first customer to start building your gaming community!
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-3 mx-auto"
            >
              <span className="text-2xl">🎮</span>
              <span>ADD FIRST CUSTOMER</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
