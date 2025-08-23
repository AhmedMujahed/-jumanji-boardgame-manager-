import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, Reservation, Customer, Session } from '../types';

interface TableManagementProps {
  tables: Table[];
  reservations: Reservation[];
  customers: Customer[];
  sessions: Session[];
  onAddTable: (table: Omit<Table, 'id'>) => void;
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void;
  onDeleteTable: (tableId: string) => void;
  onAddReservation: (reservation: Omit<Reservation, 'id'>) => void;
  onUpdateReservation: (reservationId: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (reservationId: string) => void;
}

const TableManagement: React.FC<TableManagementProps> = ({
  tables,
  reservations,
  customers,
  sessions,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onAddReservation,
  onUpdateReservation,
  onDeleteReservation
}) => {
  const [showAddTableForm, setShowAddTableForm] = useState(false);
  const [showAddReservationForm, setShowAddReservationForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [tableFormData, setTableFormData] = useState({
    name: '',
    capacity: 4,
    type: 'standard' as 'standard' | 'premium' | 'vip',
    features: [] as string[],
    isAvailable: true,
    location: ''
  });

  const [reservationFormData, setReservationFormData] = useState({
    tableId: '',
    customerId: '',
    startTime: '',
    endTime: '',
    partySize: 2,
    notes: ''
  });

  const tableTypes = [
    { value: 'standard', label: 'Standard', icon: '🟢', color: 'success', price: 30 },
    { value: 'premium', label: 'Premium', icon: '🟡', color: 'warning', price: 45 },
    { value: 'vip', label: 'VIP', icon: '🟣', color: 'purple', price: 60 }
  ];

  const tableFeatures = [
    'LED Lighting', 'Sound System', 'Comfortable Chairs', 'Side Tables', 'Storage', 'Power Outlets'
  ];

  const reservationStatuses = [
    { value: 'confirmed', label: 'Confirmed', icon: '✅', color: 'success' },
    { value: 'pending', label: 'Pending', icon: '⏳', color: 'warning' },
    { value: 'cancelled', label: 'Cancelled', icon: '❌', color: 'danger' }
  ];

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTable({
      name: tableFormData.name,
      capacity: tableFormData.capacity,
      type: tableFormData.type,
      features: tableFormData.features,
      isAvailable: tableFormData.isAvailable,
      location: tableFormData.location,
      createdAt: new Date().toISOString()
    });
    setTableFormData({
      name: '',
      capacity: 4,
      type: 'standard',
      features: [],
      isAvailable: true,
      location: ''
    });
    setShowAddTableForm(false);
  };

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReservation({
      tableId: reservationFormData.tableId,
      customerId: reservationFormData.customerId,
      startTime: reservationFormData.startTime,
      endTime: reservationFormData.endTime,
      partySize: reservationFormData.partySize,
      status: 'confirmed',
      notes: reservationFormData.notes,
      createdAt: new Date().toISOString()
    });
    setReservationFormData({
      tableId: '',
      customerId: '',
      startTime: '',
      endTime: '',
      partySize: 2,
      notes: ''
    });
    setShowAddReservationForm(false);
  };

  const handleTableInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTableFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleReservationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setReservationFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setTableFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const filteredTables = tables.filter(table => {
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'available' && table.isAvailable) ||
      (selectedStatus === 'occupied' && !table.isAvailable);
    return selectedTable === 'all' || table.id === selectedTable || matchesStatus;
  });

  const filteredReservations = reservations.filter(reservation => {
    const matchesTable = selectedTable === 'all' || reservation.tableId === selectedTable;
    const matchesStatus = selectedStatus === 'all' || reservation.status === selectedStatus;
    return matchesTable && matchesStatus;
  });

  const getTableStatus = (table: Table) => {
    const activeReservation = reservations.find(r => 
      r.tableId === table.id && 
      r.status === 'confirmed' && 
      new Date(r.startTime) <= new Date() && 
      new Date(r.endTime) >= new Date()
    );

    if (activeReservation) {
      const customer = customers.find(c => c.id === activeReservation.customerId);
      return {
        status: 'occupied',
        customer: customer?.name || 'Unknown',
        endTime: activeReservation.endTime
      };
    }

    return { status: 'available', customer: null, endTime: null };
  };

  const getTableTypeInfo = (type: string) => {
    return tableTypes.find(t => t.value === type) || tableTypes[0];
  };

  const getReservationStatusInfo = (status: string) => {
    return reservationStatuses.find(s => s.value === status) || reservationStatuses[0];
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">🏠</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Table & Room Management
            </h2>
            <p className="text-void-800 dark:text-neon-bright/80 font-arcade">
              Manage gaming tables and reservations
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddReservationForm(true)}
            className="px-6 py-3 bg-gold-bright hover:bg-gold-neon text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-gold-lg border-2 border-gold-bright flex items-center space-x-2"
          >
            <span className="text-xl">📅</span>
            <span>BOOK TABLE</span>
          </button>
          <button 
            onClick={() => setShowAddTableForm(true)}
            className="px-6 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>ADD TABLE</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-6 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Table Filter
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
            >
              <option value="all">All Tables</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name} ({table.capacity} players)
                </option>
              ))}
            </select>
          </div>

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
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tables Overview */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-gold-bright/50 dark:border-gold-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Gaming Tables Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map(table => {
            const tableStatus = getTableStatus(table);
            const typeInfo = getTableTypeInfo(table.type);
            
            return (
              <div 
                key={table.id} 
                className={`bg-light-200 dark:bg-void-800/50 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  tableStatus.status === 'available' 
                    ? 'border-success-500/50 dark:border-success-500' 
                    : 'border-warning-500/50 dark:border-warning-500'
                }`}
              >
                <div className="p-6">
                  {/* Table Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-arcade font-bold text-void-900 dark:text-white text-lg mb-2">
                        {table.name}
                      </h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-arcade font-bold ${
                          typeInfo.color === 'success' ? 'bg-success-500/20 text-success-400 border border-success-500' :
                          typeInfo.color === 'warning' ? 'bg-warning-500/20 text-warning-400 border border-warning-500' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500'
                        }`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <span className="px-2 py-1 bg-neon-bright/20 text-neon-bright border border-neon-bright rounded-full text-xs font-arcade font-bold">
                          {table.capacity} 👥
                        </span>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      tableStatus.status === 'available' ? 'bg-success-500' : 'bg-warning-500'
                    }`} title={tableStatus.status === 'available' ? 'Available' : 'Occupied'} />
                  </div>

                  {/* Table Features */}
                  {table.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-xs mb-2">
                        Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {table.features.map(feature => (
                          <span key={feature} className="px-2 py-1 bg-void-300 dark:bg-void-700 text-void-800 dark:text-neon-bright rounded text-xs font-arcade">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Table Status */}
                  <div className="mb-4">
                    {tableStatus.status === 'occupied' ? (
                      <div className="bg-warning-500/20 border border-warning-500 rounded-lg p-3">
                        <p className="text-warning-600 dark:text-warning-400 font-arcade font-bold text-sm">
                          🎮 Occupied by {tableStatus.customer}
                        </p>
                        <p className="text-warning-600 dark:text-warning-400 font-arcade text-xs">
                          Until {format(new Date(tableStatus.endTime!), 'HH:mm')}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-success-500/20 border border-success-500 rounded-lg p-3">
                        <p className="text-success-600 dark:text-success-400 font-arcade font-bold text-sm">
                          ✅ Available for booking
                        </p>
                        <p className="text-success-600 dark:text-success-400 font-arcade text-xs">
                          {typeInfo.price} SAR/hour
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Table Location */}
                  {table.location && (
                    <div className="mb-4">
                      <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-xs">
                        📍 {table.location}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onUpdateTable(table.id, { isAvailable: !table.isAvailable })}
                      className={`flex-1 px-3 py-2 rounded-lg font-arcade font-bold text-sm transition-all duration-300 ${
                        table.isAvailable
                          ? 'bg-warning-600 hover:bg-warning-700 text-white'
                          : 'bg-success-600 hover:bg-success-700 text-white'
                      }`}
                    >
                      {table.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button 
                      onClick={() => onDeleteTable(table.id)}
                      className="px-3 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-all duration-300"
                      title="Delete table"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTables.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🏠</div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
              No tables found
            </h3>
            <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-lg mb-8">
              Add your first gaming table to start managing your space!
            </p>
            <button 
              onClick={() => setShowAddTableForm(true)}
              className="px-8 py-4 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-3 mx-auto"
            >
              <span className="text-2xl">🎮</span>
              <span>ADD FIRST TABLE</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddTableForm && (
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-light-100 dark:bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8 w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🏠</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Add New Gaming Table
                </h3>
              </div>
              <button 
                onClick={() => setShowAddTableForm(false)}
                className="p-2 bg-light-200 dark:bg-void-800 hover:bg-light-300 dark:hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddTable} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Table Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={tableFormData.name}
                    onChange={handleTableInputChange}
                    placeholder="e.g., Table 1, VIP Corner"
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Capacity (Players) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={tableFormData.capacity}
                    onChange={handleTableInputChange}
                    min="2"
                    max="20"
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Table Type *
                  </label>
                  <select
                    name="type"
                    value={tableFormData.type}
                    onChange={handleTableInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  >
                    {tableTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label} ({type.price} SAR/hour)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={tableFormData.location}
                    onChange={handleTableInputChange}
                    placeholder="e.g., Main Hall, VIP Room"
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Table Features
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tableFeatures.map(feature => (
                    <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tableFormData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 text-neon-bright border-2 border-neon-bright rounded focus:ring-neon-glow"
                      />
                      <span className="text-void-800 dark:text-neon-bright font-arcade text-sm">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={tableFormData.isAvailable}
                  onChange={handleTableInputChange}
                  className="w-5 h-5 text-neon-bright border-2 border-neon-bright rounded focus:ring-neon-glow"
                />
                <label className="text-void-800 dark:text-neon-bright font-arcade font-bold">
                  Table is available for booking
                </label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddTableForm(false)}
                  className="flex-1 px-4 py-3 bg-light-300 dark:bg-void-700 hover:bg-light-400 dark:hover:bg-void-600 text-void-800 dark:text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-light-400 dark:border-void-600 hover:border-neon-bright/50"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright"
                >
                  ADD TABLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reservation Modal */}
      {showAddReservationForm && (
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-light-100 dark:bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-gold-bright p-8 w-full max-w-md animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📅</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Book Gaming Table
                </h3>
              </div>
              <button 
                onClick={() => setShowAddReservationForm(false)}
                className="p-2 bg-light-200 dark:bg-void-800 hover:bg-light-300 dark:hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddReservation} className="space-y-6">
              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Table *
                </label>
                <select
                  name="tableId"
                  value={reservationFormData.tableId}
                  onChange={handleReservationInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                >
                  <option value="">Select a table</option>
                  {tables.filter(t => t.isAvailable).map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.capacity} players)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Customer *
                </label>
                <select
                  name="customerId"
                  value={reservationFormData.customerId}
                  onChange={handleReservationInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={reservationFormData.startTime}
                    onChange={handleReservationInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={reservationFormData.endTime}
                    onChange={handleReservationInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Party Size *
                </label>
                <input
                  type="number"
                  name="partySize"
                  value={reservationFormData.partySize}
                  onChange={handleReservationInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={reservationFormData.notes}
                  onChange={handleReservationInputChange}
                  placeholder="Special requests or notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gold-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddReservationForm(false)}
                  className="flex-1 px-4 py-3 bg-light-300 dark:bg-void-700 hover:bg-light-400 dark:hover:bg-void-600 text-void-800 dark:text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-light-400 dark:border-void-600 hover:border-neon-bright/50"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-gold-bright hover:bg-gold-neon text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-gold-lg border-2 border-gold-bright"
                >
                  BOOK TABLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-8 transition-colors duration-300">
        <h3 className="text-2xl font-arcade font-black text-gold-bright mb-6">
          Current Reservations
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-neon-bright/30">
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Table</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Customer</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Time</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Party Size</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Status</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => {
                const table = tables.find(t => t.id === reservation.tableId);
                const customer = customers.find(c => c.id === reservation.customerId);
                const statusInfo = getReservationStatusInfo(reservation.status);
                
                return (
                  <tr 
                    key={reservation.id}
                    className="border-b border-neon-bright/20 hover:bg-light-200 dark:hover:bg-void-800/50 transition-colors duration-300"
                  >
                    <td className="py-4 px-4">
                      <div className="font-arcade font-bold text-void-900 dark:text-white">
                        {table?.name || 'Unknown Table'}
                      </div>
                      <div className="text-void-700 dark:text-neon-bright/70 font-arcade text-xs">
                        {table?.capacity || 0} players
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-arcade font-bold text-void-900 dark:text-white">
                        {customer?.name || 'Unknown Customer'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm">
                        {format(new Date(reservation.startTime), 'MMM dd, HH:mm')}
                      </div>
                      <div className="text-void-800 dark:text-neon-bright font-arcade text-xs">
                        to {format(new Date(reservation.endTime), 'HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-arcade font-bold text-void-900 dark:text-white">
                        {reservation.partySize} 👥
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-arcade font-bold ${
                        statusInfo.color === 'success' ? 'bg-success-500/20 text-success-400 border border-success-500' :
                        statusInfo.color === 'warning' ? 'bg-warning-500/20 text-warning-400 border border-warning-500' :
                        'bg-danger-500/20 text-danger-400 border border-danger-500'
                      }`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onUpdateReservation(reservation.id, { 
                            status: reservation.status === 'confirmed' ? 'cancelled' : 'confirmed' 
                          })}
                          className={`px-3 py-1 rounded-lg text-xs font-arcade font-bold transition-all duration-300 ${
                            reservation.status === 'confirmed'
                              ? 'bg-danger-600 hover:bg-danger-700 text-white'
                              : 'bg-success-600 hover:bg-success-700 text-white'
                          }`}
                        >
                          {reservation.status === 'confirmed' ? 'Cancel' : 'Confirm'}
                        </button>
                        <button 
                          onClick={() => onDeleteReservation(reservation.id)}
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
        {filteredReservations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
              No reservations found
            </h3>
            <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-lg mb-8">
              {selectedTable !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your filters'
                : 'Book your first table to start managing reservations!'
              }
            </p>
            {selectedTable === 'all' && selectedStatus === 'all' && (
              <button 
                onClick={() => setShowAddReservationForm(true)}
                className="px-8 py-4 bg-gold-bright hover:bg-gold-neon text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-gold-lg border-2 border-gold-bright flex items-center space-x-3 mx-auto"
              >
                <span className="text-2xl">📅</span>
                <span>BOOK FIRST TABLE</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManagement;
