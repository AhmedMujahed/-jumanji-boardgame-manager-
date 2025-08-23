import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import SessionTimer from './SessionTimer';
import { User, Customer, Session, Table } from '../types';
import { getAvailableTables, isTableAvailableForSession } from '../utils/tableManagement';

interface SessionManagementProps {
  customers: Customer[];
  sessions: Session[];
  tables: Table[];
  onAddSession: (session: Omit<Session, 'id' | 'startTime' | 'status' | 'totalCost' | 'hours'>) => void;
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
  onEndSession: (sessionId: string) => void;
  user: User;
}

const SessionManagement: React.FC<SessionManagementProps> = ({ 
  customers, 
  sessions, 
  tables,
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
  }>({
    customerId: '',
    notes: '',
    gameMasterId: user.id,
    capacity: 1,
    male: 1,
    female: 0,
    tableId: '',
    tableNumber: 0
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

  // Update current time every second for live cost calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to get default gender breakdown
  const getDefaultGenderBreakdown = (session: Session) => {
    return session.genderBreakdown || { male: 0, female: 0 };
  };

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

  // Get available tables for the current capacity
  const getAvailableTablesForCapacity = () => {
    return tables.filter(table => table.status === 'available' && table.capacity >= formData.capacity);
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
         ...editFormData,
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
    
    // First 30 minutes = 30 SAR, then every hour after that
    if (totalMinutes <= 30) {
      return 30 * session.capacity; // First 30 min
    } else {
      const hoursAfter30Min = Math.ceil((totalMinutes - 30) / 60); // Hours after first 30 min
      return (30 + (hoursAfter30Min * 30)) * session.capacity; // 30 SAR + hourly rate
    }
  };

  const getCostBreakdown = (session: Session) => {
    if (session.status !== 'active') return '';
    const startTime = new Date(session.startTime);
    const totalMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    if (totalMinutes <= 30) {
      return `First 30 min: ${30 * session.capacity} SAR (${session.capacity} people)`;
    } else {
      const hoursAfter30Min = Math.ceil((totalMinutes - 30) / 60);
      const currentCost = (30 + (hoursAfter30Min * 30)) * session.capacity;
      return `${hoursAfter30Min + 0.5} hours: ${currentCost} SAR (${session.capacity} people)`;
    }
  };

  const getNextCostThreshold = (session: Session) => {
    if (session.status !== 'active') return '';
    const startTime = new Date(session.startTime);
    const totalMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    if (totalMinutes < 30) {
      const remainingMinutes = 30 - totalMinutes;
      return `Next charge in ${Math.ceil(remainingMinutes)}m (30 SAR)`;
    } else {
      const minutesInCurrentHour = Math.floor(totalMinutes % 60);
      const remainingMinutes = 60 - minutesInCurrentHour;
      return `Next charge in ${remainingMinutes}m (30 SAR)`;
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
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8 w-full max-w-md animate-fade-in">
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
                       🏠 Table {table.tableNumber} - {table.type} ({table.capacity} people)
                     </option>
                   ))}
                 </select>
                  {formData.tableId && (
                    <div className="mt-2 text-neon-bright/70 font-arcade text-xs">
                      ✅ Table selected: {tables.find(t => t.id === formData.tableId)?.tableNumber}
                    </div>
                  )}
                </div>

              {/* Capacity and Gender Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Total People *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="male" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Male Count
                  </label>
                  <input
                    type="number"
                    id="male"
                    name="male"
                    value={formData.male}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.capacity}
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="female" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Female Count
                  </label>
                  <input
                    type="number"
                    id="female"
                    name="female"
                    value={formData.female}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.capacity}
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                  />
                </div>
              </div>

                                                {/* Gender Summary */}
                 <div className={`p-3 rounded-lg border ${
                   formData.male + formData.female === formData.capacity 
                     ? 'bg-void-700/30 border-neon-bright/20' 
                     : 'bg-danger-500/20 border-danger-500/50'
                 }`}>
                   <div className="text-center">
                     <div className={`font-arcade text-sm ${
                       formData.male + formData.female === formData.capacity 
                         ? 'text-neon-bright/80' 
                         : 'text-danger-400'
                     }`}>
                       <strong>👥 Session Summary:</strong> {formData.capacity} people total
                     </div>
                     <div className={`text-xs mt-1 ${
                       formData.male + formData.female === formData.capacity 
                         ? 'text-neon-bright/60' 
                         : 'text-danger-400/80'
                     }`}>
                       🚹 {formData.male} Male • 🚺 {formData.female} Female • 💰 First 30 min: {30 * formData.capacity} SAR
                     </div>
                     {formData.male + formData.female !== formData.capacity && (
                       <div className="text-danger-400 font-arcade font-bold text-sm mt-2">
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
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-gold-bright p-8 w-full max-w-md animate-fade-in">
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
                       🏠 Table {table.tableNumber} - {table.type} ({table.capacity} people)
                     </option>
                   ))}
                 </select>
              </div>

              {/* Capacity and Gender Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="editCapacity" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Total People *
                  </label>
                                     <input
                     type="number"
                     id="editCapacity"
                     name="capacity"
                     value={editFormData.capacity}
                     onChange={(e) => setEditFormData(prev => ({ ...prev, capacity: Number(e.target.value) || 1 }))}
                     min="1"
                     max="20"
                     required
                     className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                   />
                </div>
                
                <div>
                  <label htmlFor="editMale" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Male Count
                  </label>
                                     <input
                     type="number"
                     id="editMale"
                     name="male"
                     value={editFormData.male}
                     onChange={(e) => setEditFormData(prev => ({ ...prev, male: Number(e.target.value) || 0 }))}
                     min="0"
                     max={editFormData.capacity}
                     required
                     className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                   />
                </div>
                
                <div>
                  <label htmlFor="editFemale" className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Female Count
                  </label>
                                     <input
                     type="number"
                     id="editFemale"
                     name="female"
                     value={editFormData.female}
                     onChange={(e) => setEditFormData(prev => ({ ...prev, female: Number(e.target.value) || 0 }))}
                     min="0"
                     max={editFormData.capacity}
                     required
                     className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
                   />
                </div>
              </div>

              {/* Gender Summary */}
              <div className={`p-3 rounded-lg border ${
                editFormData.male + editFormData.female === editFormData.capacity 
                  ? 'bg-void-700/30 border-gold-bright/20' 
                  : 'bg-danger-500/20 border-danger-500/50'
              }`}>
                <div className="text-center">
                  <div className={`font-arcade text-sm ${
                    editFormData.male + editFormData.female === editFormData.capacity 
                      ? 'text-gold-bright/80' 
                      : 'text-danger-400'
                  }`}>
                    <strong>👥 Session Summary:</strong> {editFormData.capacity} people total
                  </div>
                  <div className={`text-xs mt-1 ${
                    editFormData.male + editFormData.female === editFormData.capacity 
                      ? 'text-gold-bright/60' 
                      : 'text-danger-400/80'
                  }`}>
                                         🚹 {editFormData.male} Male • 🚺 {editFormData.female} Female • 💰 First 30 min: {30 * editFormData.capacity} SAR
                  </div>
                  {editFormData.male + editFormData.female !== editFormData.capacity && (
                    <div className="text-danger-400 font-arcade font-bold text-sm mt-2">
                      ⚠️ Gender count must equal total people!
                    </div>
                  )}
                </div>
              </div>

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
                      onUpdate={(elapsedTime) => {
                        // Update session with elapsed time if needed
                      }}
                    />
                  </div>

                  {/* Cost Display */}
                  <div className="mb-4 p-4 bg-void-700/50 rounded-xl border border-gold-bright/30">
                    <div className="text-center">
                      <div className="text-2xl font-arcade font-black text-gold-bright mb-2">
                        {calculateCurrentCost(session)} SAR
                      </div>
                      <div className="text-gold-bright/70 font-arcade text-sm mb-2">
                        💰 LIVE TOTAL COST
                      </div>
                      <div className="text-gold-bright/60 font-arcade text-xs">
                        {getCostBreakdown(session)}
                      </div>
                    </div>
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
                    onClick={() => onEndSession(session.id)}
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
    </div>
  );
};

export default SessionManagement;
