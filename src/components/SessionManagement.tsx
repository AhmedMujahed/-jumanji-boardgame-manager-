import React, { useState, useEffect } from 'react';
import ModalPortal from './ModalPortal';
import { format, formatDistanceToNow } from 'date-fns';
import SessionTimer from './SessionTimer';
import { User, Customer, Session, Table, Promotion } from '../types';
import { getAvailableTables, isTableAvailableForSession } from '../utils/tableManagement';

interface SessionManagementProps {
  customers: Customer[];
  sessions: Session[];
  tables: Table[];
  promotions?: Promotion[];
  onAddSession: (session: Omit<Session, 'id' | 'startTime' | 'status' | 'totalCost' | 'hours'>) => void;
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
  onEndSession: (sessionId: string) => void;
  user: User;
}

const SessionManagement: React.FC<SessionManagementProps> = ({ 
  customers, 
  sessions, 
  tables,
  promotions = [],
  onAddSession, 
  onUpdateSession, 
  onEndSession,
  user
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    customerId: string;
    notes: string;
    gameMasterId: string;
    capacity: number;
    male: number;
    female: number;
    tableId: string;
    tableNumber: number;
    promoId?: string;
  }>({
    customerId: '',
    notes: '',
    gameMasterId: user.id,
    capacity: 1,
    male: 1,
    female: 0,
    tableId: '',
    tableNumber: 0,
    promoId: undefined
  });

  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    notes: string;
    status: 'active' | 'completed' | 'cancelled';
    capacity: number;
    male: number;
    female: number;
    tableId: string;
    tableNumber: number;
  }>({
    notes: '',
    status: 'active',
    capacity: 1,
    male: 1,
    female: 0,
    tableId: '',
    tableNumber: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEndConfirmation, setShowEndConfirmation] = useState<string | null>(null);

  // Update current time every second for live cost calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that male + female equals capacity
    if (formData.male + formData.female !== formData.capacity) {
      alert(`Gender count mismatch! Male (${formData.male}) + Female (${formData.female}) must equal Total People (${formData.capacity})`);
      return;
    }
    
    if (formData.customerId && formData.tableId) {
      onAddSession({
        customerId: formData.customerId,
        notes: formData.notes,
        gameMasterId: user.id,
        capacity: formData.capacity,
        genderBreakdown: {
          male: formData.male,
          female: formData.female
        },
        tableId: formData.tableId,
        tableNumber: formData.tableNumber,
        createdAt: new Date().toISOString()
      });
      setFormData({ 
        customerId: '', 
        notes: '', 
        gameMasterId: user.id,
        capacity: 1,
        male: 1,
        female: 0,
        tableId: '',
        tableNumber: 0
      });
      setShowAddForm(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let newData = { ...prev };
      
      // Handle numeric fields - convert to numbers
      if (name === 'capacity') {
        const numValue = Number(value) || 0;
        newData.capacity = numValue;
        
        // If capacity changes, adjust gender counts to maintain balance
        const currentTotal = prev.male + prev.female;
        
        if (numValue >= currentTotal) {
          // If new capacity is greater or equal, keep current gender breakdown
          // newData.capacity is already set above
        } else {
          // If new capacity is less, adjust gender counts proportionally
          const ratio = numValue / currentTotal;
          newData = {
            ...newData,
            male: Math.round(prev.male * ratio),
            female: numValue - Math.round(prev.male * ratio)
          };
        }
      } else if (name === 'male') {
        const numValue = Number(value) || 0;
        newData.male = numValue;
        
        // Ensure male + female doesn't exceed capacity
        if (numValue + prev.female > prev.capacity) {
          // Adjust the female count to fit within capacity
          newData.female = Math.max(0, prev.capacity - numValue);
        }
      } else if (name === 'female') {
        const numValue = Number(value) || 0;
        newData.female = numValue;
        
        // Ensure male + female doesn't exceed capacity
        if (prev.male + numValue > prev.capacity) {
          // Adjust the male count to fit within capacity
          newData.male = Math.max(0, prev.capacity - numValue);
        }
      } else {
        // Handle string fields
        if (name === 'customerId' || name === 'notes' || name === 'tableId') {
          newData[name] = value;
        }
      }
      
      return newData;
    });
  };

  // Get available tables (no capacity restriction)
  const getAvailableTablesForCapacity = () => {
    return tables.filter(table => table.status === 'available'); // Show all available tables
  };

  const handleEditSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setEditFormData({
        notes: session.notes || '',
        status: session.status,
        capacity: session.capacity,
        male: session.genderBreakdown?.male || 0,
        female: session.genderBreakdown?.female || 0,
        tableId: session.tableId,
        tableNumber: session.tableNumber || 0
      });
      setEditingSession(sessionId);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that male + female equals capacity
    if (editFormData.male + editFormData.female !== editFormData.capacity) {
      alert(`Gender count mismatch! Male (${editFormData.male}) + Female (${editFormData.female}) must equal Total People (${editFormData.capacity})`);
      return;
    }
    
    if (editingSession) {
      onUpdateSession(editingSession, {
        notes: editFormData.notes,
        status: editFormData.status,
        capacity: editFormData.capacity,
        genderBreakdown: {
          male: editFormData.male,
          female: editFormData.female
        }
      });
      setEditingSession(null);
      setEditFormData({ notes: '', status: 'active', capacity: 1, male: 1, female: 0, tableId: '', tableNumber: 0 });
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      onUpdateSession(sessionId, { status: 'cancelled' });
    }
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditFormData({ notes: '', status: 'active', capacity: 1, male: 1, female: 0, tableId: '', tableNumber: 0 });
  };

  const handleEndSessionClick = (sessionId: string) => {
    setShowEndConfirmation(sessionId);
  };

  const handleConfirmEndSession = () => {
    if (showEndConfirmation) {
      onEndSession(showEndConfirmation);
      setShowEndConfirmation(null);
    }
  };

  const handleCancelEndSession = () => {
    setShowEndConfirmation(null);
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const calculateCurrentCost = (session: Session) => {
    if (session.status !== 'active') return session.totalCost;
    const startTime = new Date(session.startTime);
    const totalMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
    const firstHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.firstHourPrice || 30) : 30;
    const extraHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.extraHourPrice || 30) : 30;
    
    if (totalMinutes < 30) {
      return 0;
    } else if (totalMinutes < 90) { // 30min to 1h30min
      return firstHourPrice * session.capacity;
    } else {
      // After 1h30min: first hour + extra hours (every hour from 1h30min)
      const extraHours = Math.floor((totalMinutes - 90) / 60) + 1;
      return (firstHourPrice + (extraHours * extraHourPrice)) * session.capacity;
    }
  };

  const getCostBreakdown = (session: Session) => {
    if (session.status !== 'active') return '';
    const startTime = new Date(session.startTime);
    const totalMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
    const firstHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.firstHourPrice || 30) : 30;
    const extraHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.extraHourPrice || 30) : 30;
    
    if (totalMinutes < 30) {
      const remaining = Math.ceil(30 - totalMinutes);
      return `First 30 min: 0 SAR • charge ${firstHourPrice * session.capacity} SAR in ${remaining}m (${session.capacity} people)`;
    } else if (totalMinutes < 90) {
      const remaining = Math.ceil(90 - totalMinutes);
      return `30min-1h30min: ${firstHourPrice * session.capacity} SAR • next charge ${extraHourPrice * session.capacity} SAR in ${remaining}m (${session.capacity} people)`;
    } else {
      const extraHours = Math.floor((totalMinutes - 90) / 60) + 1;
      const currentCost = (firstHourPrice + (extraHours * extraHourPrice)) * session.capacity;
      const minutesInCurrentHour = Math.floor((totalMinutes - 90) % 60);
      const remaining = 60 - minutesInCurrentHour;
      return `First + ${extraHours} extra hours: ${currentCost} SAR • next charge ${extraHourPrice * session.capacity} SAR in ${remaining}m (${session.capacity} people)`;
    }
  };

  const getNextCostThreshold = (session: Session) => {
    if (session.status !== 'active') return '';
    const startTime = new Date(session.startTime);
    const totalMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
    const firstHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.firstHourPrice || 30) : 30;
    const extraHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.extraHourPrice || 30) : 30;
    
    if (totalMinutes < 30) {
      const remainingMinutes = 30 - totalMinutes;
      return `Next charge in ${Math.ceil(remainingMinutes)}m (${firstHourPrice} SAR)`;
    } else if (totalMinutes < 90) {
      const remainingMinutes = 90 - totalMinutes;
      return `Next charge in ${Math.ceil(remainingMinutes)}m (${extraHourPrice} SAR)`;
    } else {
      const minutesInCurrentHour = Math.floor((totalMinutes - 90) % 60);
      const remainingMinutes = 60 - minutesInCurrentHour;
      return `Next charge in ${remainingMinutes}m (${extraHourPrice} SAR)`;
    }
  };

  const getCostProgress = (session: Session) => {
    if (session.status !== 'active') return 0;
    const startTime = new Date(session.startTime);
    const totalMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    if (totalMinutes < 30) {
      return (totalMinutes / 30) * 100; // Progress to first 30 min
    } else {
      const minutesInCurrentHour = totalMinutes % 60;
      return (minutesInCurrentHour / 60) * 100; // Progress to next hour
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">⏱️</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Session Management
            </h2>
            <p className="text-neon-bright/80 font-arcade">
              Track gaming sessions in real-time
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          disabled={customers.length === 0}
          className={`px-6 py-3 font-arcade font-black rounded-xl transition-all duration-300 transform border-2 flex items-center space-x-2 ${
            customers.length === 0
              ? 'bg-void-700 text-void-400 border-void-600 cursor-not-allowed'
              : 'bg-neon-bright hover:bg-neon-glow text-void-1000 hover:scale-105 shadow-neon hover:shadow-neon-lg border-neon-bright'
          }`}
        >
          <span className="text-xl">🎮</span>
          <span>START SESSION</span>
        </button>
      </div>

      {/* No customers warning */}
      {customers.length === 0 && (
        <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-warning-500 p-8">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-arcade font-black text-warning-400 mb-4">
              No customers available
            </h3>
            <p className="text-neon-bright/70 font-arcade">
              You need to add customers before starting sessions.
            </p>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddForm && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] p-4">
            <div className="bg-[#0D0D1A] p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-4 animate-fade-in border-2 border-neon-bright max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎮</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Start New Session
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
                <label htmlFor="customerId" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Select Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                >
                  <option value="">Choose a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

                              {/* Table Selection */}
                <div>
                  <label htmlFor="tableId" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Select Table *
                  </label>
                                   <select
                   id="tableId"
                   name="tableId"
                   value={formData.tableId}
                   onChange={(e) => {
                     const selectedTable = tables.find(t => t.id === e.target.value);
                     setFormData(prev => ({
                       ...prev,
                       tableId: e.target.value,
                       tableNumber: selectedTable?.tableNumber || 0
                     }));
                   }}
                   required
                   className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                 >
                   <option value="">Choose a table</option>
                   {getAvailableTablesForCapacity().map(table => (
                     <option key={table.id} value={table.id}>
                       🏠 Table {table.tableNumber} - {table.type}
                     </option>
                   ))}
                 </select>
                  {formData.tableId && (
                    <div className="mt-2 text-neon-bright/70 font-arcade text-xs">
                      ✅ Table selected: {tables.find(t => t.id === formData.tableId)?.tableNumber}
                    </div>
                  )}
                </div>

              {/* Promotion Display (auto-applied) */}
              {promotions.filter(p => p.isActive).length > 0 && (
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Promotion</label>
                  <div className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white font-arcade">
                    {(() => {
                      const now = new Date();
                      const active = promotions.find(p => p.isActive && (!p.startDate || new Date(p.startDate) <= now) && (!p.endDate || new Date(p.endDate) >= now));
                      return active ? `${active.name} — 1st: ${active.firstHourPrice} • Extra: ${active.extraHourPrice}` : 'No active promotion';
                    })()}
                  </div>
                </div>
              )}

              {/* Total People Section */}
              <div className="bg-void-800/50 p-8 rounded-2xl border-2 border-neon-bright/30 mb-8">
                <h3 className="text-2xl font-arcade font-bold text-gold-bright mb-6 text-center">🎯 Total People</h3>
                <div className="max-w-md mx-auto">
                  <select
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 border-2 border-neon-bright rounded-2xl focus:ring-4 focus:ring-neon-glow focus:border-transparent bg-void-900 text-white font-arcade transition-all duration-300 text-center text-xl"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender Counter Section */}
              <div className="bg-void-800/50 p-8 rounded-2xl border-2 border-neon-bright/30 mb-8">
                <h3 className="text-2xl font-arcade font-bold text-gold-bright mb-8 text-center">👥 Gender Count</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Male Counter */}
                  <div className="bg-void-700/50 p-8 rounded-2xl border-2 border-blue-400/50">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-arcade font-bold text-blue-400 mb-2">🚹 Male</h4>
                    </div>
                    <div className="flex items-center justify-center space-x-6">
                      <button
                        type="button"
                        onClick={() => {
                          const newMale = Math.max(0, formData.male - 1);
                          const newFemale = Math.min(formData.capacity - newMale, formData.female);
                          setFormData(prev => ({ ...prev, male: newMale, female: newFemale }));
                        }}
                        className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white font-arcade font-bold text-2xl rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                      >
                        −
                      </button>
                      <div className="w-24 h-24 bg-void-900 border-4 border-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-arcade font-bold text-blue-400">{formData.male}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newMale = Math.min(formData.capacity, formData.male + 1);
                          const newFemale = formData.capacity - newMale;
                          setFormData(prev => ({ ...prev, male: newMale, female: newFemale }));
                        }}
                        className="w-16 h-16 bg-green-600 hover:bg-green-500 text-white font-arcade font-bold text-2xl rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Female Counter */}
                  <div className="bg-void-700/50 p-8 rounded-2xl border-2 border-pink-400/50">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-arcade font-bold text-pink-400 mb-2">🚺 Female</h4>
                    </div>
                    <div className="flex items-center justify-center space-x-6">
                      <button
                        type="button"
                        onClick={() => {
                          const newFemale = Math.max(0, formData.female - 1);
                          const newMale = Math.min(formData.capacity - newFemale, formData.male);
                          setFormData(prev => ({ ...prev, female: newFemale, male: newMale }));
                        }}
                        className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white font-arcade font-bold text-2xl rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                      >
                        −
                      </button>
                      <div className="w-24 h-24 bg-void-900 border-4 border-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-arcade font-bold text-pink-400">{formData.female}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFemale = Math.min(formData.capacity, formData.female + 1);
                          const newMale = formData.capacity - newFemale;
                          setFormData(prev => ({ ...prev, female: newFemale, male: newMale }));
                        }}
                        className="w-16 h-16 bg-green-600 hover:bg-green-500 text-white font-arcade font-bold text-2xl rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Summary */}
              <div className={`p-8 rounded-2xl border-2 mb-8 ${
                formData.male + formData.female === formData.capacity 
                  ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-400/50' 
                  : 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-400/50'
              }`}>
                <div className="text-center">
                  <div className={`font-arcade text-2xl font-bold mb-8 ${
                    formData.male + formData.female === formData.capacity 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {formData.male + formData.female === formData.capacity ? '✅' : '⚠️'} Session Summary
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="bg-void-900/50 p-6 rounded-2xl border-2 border-gold-bright/50 shadow-lg">
                      <div className="text-gold-bright font-arcade font-bold text-lg mb-2">Total People</div>
                      <div className="text-5xl font-arcade font-bold text-gold-bright">{formData.capacity}</div>
                    </div>
                    <div className="bg-void-900/50 p-6 rounded-2xl border-2 border-blue-400/50 shadow-lg">
                      <div className="text-blue-400 font-arcade font-bold text-lg mb-2">🚹 Male</div>
                      <div className="text-5xl font-arcade font-bold text-blue-400">{formData.male}</div>
                    </div>
                    <div className="bg-void-900/50 p-6 rounded-2xl border-2 border-pink-400/50 shadow-lg">
                      <div className="text-pink-400 font-arcade font-bold text-lg mb-2">🚺 Female</div>
                      <div className="text-5xl font-arcade font-bold text-pink-400">{formData.female}</div>
                    </div>
                  </div>

                  <div className={`font-arcade text-xl p-4 rounded-xl border-2 ${
                    formData.male + formData.female === formData.capacity 
                      ? 'text-green-400 border-green-400/30 bg-green-900/20' 
                      : 'text-red-400 border-red-400/30 bg-red-900/20'
                  }`}>
                    💰 First 30 min: <span className="font-bold text-2xl">{30 * formData.capacity} SAR</span>
                  </div>
                  
                  {formData.male + formData.female !== formData.capacity && (
                    <div className="text-red-400 font-arcade font-bold text-lg mt-6 bg-red-900/30 p-4 rounded-xl border-2 border-red-400/50">
                      ⚠️ Gender count must equal total people!
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Session Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any notes about this session"
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
                  START SESSION
                </button>
              </div>
            </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
            <div className="bg-[#0D0D1A] p-6 rounded-2xl shadow-lg w-full max-w-md mx-4 animate-fade-in border-2 border-gold-bright">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">✏️</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Edit Session
                </h3>
              </div>
              <button 
                onClick={handleCancelEdit}
                className="p-2 bg-void-800 hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* Table Selection */}
              <div>
                <label htmlFor="editTableId" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Select Table *
                </label>
                                 <select
                   id="editTableId"
                   name="tableId"
                   value={editFormData.tableId}
                   onChange={(e) => {
                     const selectedTable = tables.find(t => t.id === e.target.value);
                     setEditFormData(prev => ({
                       ...prev,
                       tableId: e.target.value,
                       tableNumber: selectedTable?.tableNumber || 0
                     }));
                   }}
                   required
                   className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                 >
                   {tables.map(table => (
                     <option key={table.id} value={table.id}>
                       🏠 Table {table.tableNumber} - {table.type}
                     </option>
                   ))}
                 </select>
              </div>

              {/* Capacity and Gender Section */}

              <div>
                <label htmlFor="editNotes" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Session Notes
                </label>
                <textarea
                  id="editNotes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Update session notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical"
                />
              </div>

              <div>
                <label htmlFor="editStatus" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Session Status
                </label>
                <select
                  id="editStatus"
                  name="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'completed' | 'cancelled' }))}
                  className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                >
                  <option value="active">🟢 Active</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 bg-void-700 hover:bg-void-600 text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-void-600 hover:border-neon-bright/50"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-gold-bright hover:bg-gold-neon text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-gold-lg border-2 border-gold-bright"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-success-500 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🔥</span>
              <h3 className="text-2xl font-arcade font-black text-success-400">
                Active Sessions ({activeSessions.length})
              </h3>
            </div>
            <div className="text-neon-bright/70 font-arcade text-sm">
              Live tracking
            </div>
          </div>

                     {/* Pricing Info */}
           <div className="mb-6 p-4 bg-success-500/10 rounded-xl border border-success-500/30">
             <div className="text-center">
               <div className="text-success-400 font-arcade font-bold text-lg mb-2">
                 💰 Live Cost Calculation
               </div>
               <div className="text-success-400/80 font-arcade text-sm">
                 <strong>First 30 min = 30 SAR per person</strong> • Then 30 SAR per person per hour
               </div>
               <div className="text-success-400/60 font-arcade text-xs mt-1">
                 Cost updates every second • Progress bar shows time until next charge
               </div>
             </div>
           </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeSessions.map(session => {
              const customer = customers.find(c => c.id === session.customerId);
              return (
                <div 
                  key={session.id} 
                  className="bg-void-800/80 rounded-2xl border-2 border-success-500/50 hover:border-success-400 transition-all duration-300 p-6 animate-pulse-slow"
                >
                  {/* Session Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center text-void-1000 font-arcade font-black">
                        {customer?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h4 className="font-arcade font-bold text-success-400 text-lg">
                          {getCustomerName(session.customerId)}
                        </h4>
                        <div className="text-success-400/60 font-arcade text-xs">
                          🕐 Started: {new Date(session.startTime).toLocaleTimeString()}
                        </div>
                        <div className="text-success-400/60 font-arcade text-xs">
                          👥 {session.capacity} people • 🚹 {session.genderBreakdown?.male || 0}M • 🚺 {session.genderBreakdown?.female || 0}F
                        </div>
                        <div className="text-success-400/60 font-arcade text-xs">
                          🏠 Table {session.tableId}
                        </div>
                        {session.promoId && (
                          <div className="text-success-400/70 font-arcade text-xs mt-1">
                            🏷 Promo: {promotions.find(p => p.id === session.promoId)?.name} — 1st: {promotions.find(p => p.id === session.promoId)?.firstHourPrice} • Extra: {promotions.find(p => p.id === session.promoId)?.extraHourPrice}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-success-500/20 text-success-400 border border-success-500 rounded-full font-arcade font-bold text-sm animate-pulse">
                      LIVE
                    </span>
                  </div>

                  {/* Timer */}
                  <div className="mb-4">
                    <SessionTimer 
                      startTime={session.startTime}
                      firstHourPrice={session.promoId ? (promotions.find(p => p.id === session.promoId)?.firstHourPrice || 30) : 30}
                      extraHourPrice={session.promoId ? (promotions.find(p => p.id === session.promoId)?.extraHourPrice || 30) : 30}
                      capacity={session.capacity}
                      onUpdate={(elapsedTime) => {
                        // Update session with elapsed time if needed
                      }}
                    />
                  </div>



                  {/* Cost Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neon-bright/70 font-arcade text-xs font-bold">
                        ⚡ Cost Progress
                      </span>
                      <span className="text-neon-bright/60 font-arcade text-xs">
                        {getNextCostThreshold(session)}
                      </span>
                    </div>
                    <div className="w-full bg-void-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-neon-bright to-gold-bright h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(getCostProgress(session), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <div className="mb-4 p-3 bg-void-700/30 rounded-lg border border-neon-bright/20">
                      <div className="text-neon-bright/80 font-arcade text-sm">
                        <strong>📝 Notes:</strong> {session.notes}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mb-4">
                    <button 
                      onClick={() => handleEditSession(session.id)}
                      className="flex-1 px-3 py-2 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-bold rounded-lg transition-all duration-300 text-sm"
                    >
                      ✏️ EDIT
                    </button>
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className="px-3 py-2 bg-danger-600 hover:bg-danger-700 text-white font-arcade font-bold rounded-lg transition-all duration-300 text-sm"
                    >
                      🗑️ DELETE
                    </button>
                  </div>

                  {/* End Session Button */}
                  <button 
                    onClick={() => handleEndSessionClick(session.id)}
                    className="w-full px-4 py-3 bg-danger-600 hover:bg-danger-700 text-white font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-danger-600 hover:border-danger-500 flex items-center justify-center space-x-2"
                  >
                    <span>⏹️</span>
                    <span>END SESSION</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">✅</span>
              <h3 className="text-2xl font-arcade font-black text-gold-bright">
                Completed Sessions ({completedSessions.length})
              </h3>
            </div>
            <div className="text-neon-bright/70 font-arcade text-sm">
              Session history
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neon-bright/30">
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Customer</th>
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Duration</th>
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Cost</th>
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Table</th>
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Started</th>
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Ended</th>
                  <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.map(session => (
                  <tr 
                    key={session.id}
                    className="border-b border-neon-bright/20 hover:bg-void-800/50 transition-colors duration-300"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-bright to-neon-glow rounded-full flex items-center justify-center text-void-1000 font-arcade font-bold text-sm">
                          {getCustomerName(session.customerId).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-arcade font-bold text-white">
                          {getCustomerName(session.customerId)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-success-500/20 text-success-400 border border-success-500 rounded-full font-arcade font-bold text-sm">
                        {session.hours}h
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-arcade font-black text-gold-bright text-lg">
                        {session.totalCost} SAR
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-neon-bright/80 font-arcade text-sm">
                        Table {session.tableId}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-neon-bright/80 font-arcade text-sm">
                        {format(new Date(session.startTime), 'MMM dd, HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-neon-bright/80 font-arcade text-sm">
                        {session.endTime ? format(new Date(session.endTime), 'MMM dd, HH:mm') : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {session.notes ? (
                        <div 
                          title={session.notes}
                          className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-neon-bright/70 font-arcade text-sm"
                        >
                          {session.notes}
                        </div>
                      ) : (
                        <span className="text-neon-bright/40 font-arcade text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeSessions.length === 0 && completedSessions.length === 0 && customers.length > 0 && (
        <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8">
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎮</div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
              No sessions yet
            </h3>
            <p className="text-neon-bright/70 font-arcade text-lg mb-8">
              Start your first session to begin tracking time and billing!
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-3 mx-auto"
            >
              <span className="text-2xl">⚡</span>
              <span>START FIRST SESSION</span>
            </button>
          </div>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndConfirmation && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[9999] p-4">
            <div className="bg-[#0D0D1A] p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in border-2 border-red-500/50">
              {/* Modal Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-arcade font-bold text-red-400 mb-2">
                  End Session?
                </h3>
                <p className="text-neon-bright/80 font-arcade text-lg">
                  Are you sure you want to end this session?
                </p>
              </div>

              {/* Session Info */}
              {(() => {
                const session = sessions.find(s => s.id === showEndConfirmation);
                const customer = customers.find(c => c.id === session?.customerId);
                if (!session) return null;

                return (
                  <div className="bg-void-800/50 p-6 rounded-xl border border-red-400/30 mb-8">
                    <div className="text-center">
                      <div className="text-gold-bright font-arcade font-bold text-lg mb-2">
                        {customer?.name || 'Unknown Customer'}
                      </div>
                      <div className="text-neon-bright/80 font-arcade text-sm mb-2">
                        👥 {session.capacity} people • 🏠 Table {session.tableNumber}
                      </div>
                      <div className="text-neon-bright/80 font-arcade text-sm">
                        🕐 Started: {new Date(session.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Warning Message */}
              <div className="bg-red-900/30 p-4 rounded-xl border border-red-400/50 mb-8">
                <div className="text-center">
                  <div className="text-red-400 font-arcade font-bold text-sm mb-2">
                    ⚠️ This action cannot be undone!
                  </div>
                  <div className="text-red-400/80 font-arcade text-xs">
                    The session will be marked as completed and billing will be finalized.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button 
                  onClick={handleCancelEndSession}
                  className="flex-1 px-6 py-3 bg-void-700 hover:bg-void-600 text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-neon-bright/30"
                >
                  ❌ Cancel
                </button>
                <button 
                  onClick={handleConfirmEndSession}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-arcade font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-red-500"
                >
                  ⏹️ End Session
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default SessionManagement;
