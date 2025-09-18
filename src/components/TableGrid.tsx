import React, { useState } from 'react';
import ModalPortal from './ModalPortal';
import { Table, TableStatus } from '../types';
import { resetAllTables } from '../utils/tableManagement';

interface TableGridProps {
  tables: Table[];
  onTableClick?: (table: Table) => void;
  onTableStatusChange?: (tableId: string, status: TableStatus) => void;
  onRefreshTables?: () => void;
}

const TableGrid: React.FC<TableGridProps> = ({ 
  tables, 
  onTableClick, 
  onTableStatusChange,
  onRefreshTables
}) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableInfo, setShowTableInfo] = useState(false);

  // Calculate stats from the current tables prop to ensure they're always up-to-date
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length
  };





  // Get status color and icon
  const getStatusStyle = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return {
          bgColor: 'bg-green-500',
          textColor: 'text-green-800',
          borderColor: 'border-green-600',
          icon: '🟢',
          label: 'Available'
        };
      case 'occupied':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-red-800',
          borderColor: 'border-red-600',
          icon: '🔴',
          label: 'Occupied'
        };
      case 'reserved':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-600',
          icon: '🟡',
          label: 'Reserved'
        };
      case 'maintenance':
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-600',
          icon: '⚫',
          label: 'Maintenance'
        };
      default:
        return {
          bgColor: 'bg-gray-300',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-400',
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  // Get table type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'standard':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowTableInfo(true);
    onTableClick?.(table);
  };

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    // Only prevent changing status if the table has an active session
    if (selectedTable?.currentSessionId && selectedTable?.status === 'occupied') {
      if (newStatus === 'available') {
        alert('Cannot set table to available while session is active. Please end the session first.');
        return;
      }
      if (newStatus !== 'occupied') {
        alert('Cannot change table status while session is active. Please end the session first.');
        return;
      }
    }
    
    // Allow status changes for tables without active sessions
    onTableStatusChange?.(tableId, newStatus);
    setShowTableInfo(false);
  };

  return (
    <div className="space-y-6">
      {/* Table Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-void-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-neon-bright/30">
          <div className="text-center">
            <div className="text-4xl font-arcade font-black text-gold-bright mb-2">{stats.total}</div>
            <div className="text-neon-bright/80 font-arcade font-bold">Total Tables</div>
          </div>
        </div>
        <div className="bg-success-500/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-success-500/30">
          <div className="text-center">
            <div className="text-4xl font-arcade font-black text-success-400 mb-2">{stats.available}</div>
            <div className="text-success-400/80 font-arcade font-bold">Available</div>
          </div>
        </div>
        <div className="bg-danger-500/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-danger-500/30">
          <div className="text-center">
            <div className="text-4xl font-arcade font-black text-danger-400 mb-2">{stats.occupied}</div>
            <div className="text-danger-400/80 font-arcade font-bold">Occupied</div>
          </div>
        </div>
        <div className="bg-yellow-500 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-yellow-600">
          <div className="text-center">
            <div className="text-4xl font-arcade font-black text-black mb-2">
              {stats.reserved !== undefined ? stats.reserved : '0'}
            </div>
            <div className="text-black font-arcade font-bold">Reserved</div>
          </div>
        </div>
        <div className="bg-gray-500/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-gray-500/30">
          <div className="text-center">
            <div className="text-4xl font-arcade font-black text-gray-400 mb-2">{stats.maintenance}</div>
            <div className="text-gray-400/80 font-arcade font-bold">Maintenance</div>
          </div>
        </div>
      </div>

      {/* Table Grid - Full width and scrollable */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright/30">
        <div className="p-8 border-b-2 border-neon-bright/20">
          <div className="text-center">
            <h2 className="text-3xl font-arcade font-black text-gold-bright mb-3">🏠 Table Management</h2>
            <p className="text-neon-bright/80 font-arcade font-bold">Click on any table to view details or change status</p>
            
            {/* Initialize Tables Button */}
            {tables.length === 0 && (
              <div className="mt-4 mb-6">
                <button
                  onClick={() => {
                    if (onRefreshTables) {
                      onRefreshTables();
                    } else {
                      resetAllTables();
                      window.location.reload();
                    }
                  }}
                  className="px-6 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright"
                >
                  🚀 Initialize 15 Tables
                </button>
                <p className="text-neon-bright/60 font-arcade text-sm mt-2">
                  Click to create all 15 tables with default settings
                </p>
              </div>
            )}
            
            {/* Refresh Tables Button - Always visible */}
            <div className="mt-4 mb-6">
              <button
                onClick={() => {
                  if (onRefreshTables) {
                    onRefreshTables();
                  } else {
                    resetAllTables();
                    window.location.reload();
                  }
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-arcade font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-blue-500"
              >
                  🔄 Refresh All Tables
              </button>
              <p className="text-blue-400/70 font-arcade text-sm mt-2">
                Click to refresh all tables with standard configuration
              </p>
              

            </div>
            
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-success-400">Available</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-danger-400">Occupied</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-warning-400">Reserved</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">Maintenance</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Scrollable Table Grid */}
        <div className="p-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-h-96 overflow-y-auto">
            {tables.map((table) => {
              const statusStyle = getStatusStyle(table.status);
              
              return (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`
                    relative cursor-pointer transition-all duration-300 hover:scale-110
                    ${statusStyle.bgColor} ${statusStyle.borderColor} border-2 rounded-xl p-3
                    text-center min-h-[80px] flex flex-col items-center justify-center
                    hover:shadow-2xl transform hover:rotate-1
                    ${table.status === 'occupied' ? 'animate-pulse' : ''}
                    ${table.status === 'reserved' ? 'animate-bounce' : ''}
                    ${selectedTable?.id === table.id ? 'ring-4 ring-neon-bright ring-opacity-50' : ''}
                  `}
                >
                  {/* Table Number - Made more prominent */}
                  <div className="text-3xl font-black text-white mb-3 z-10 relative bg-black/30 px-3 py-2 rounded-lg border-2 border-white/20">
                    #{table.tableNumber}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="text-2xl mb-1">
                    {statusStyle.icon}
                  </div>
                  
                  
                  {/* Type Badge - Moved to bottom right to avoid covering table number */}
                  <div className={`
                    absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium border-2
                    bg-gray-800 text-gray-200 border-gray-600 shadow-lg z-20
                  `}>
                    STANDARD
                  </div>
                  
                  {/* Status Label */}
                  <div className="text-xs text-white font-medium mt-1">
                    {statusStyle.label}
                  </div>
                  
                  {/* Customer Name (if occupied) */}
                  {table.customerName && (
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-white font-medium truncate">
                      {table.customerName}
                    </div>
                  )}
                  
                  {/* Selection Indicator */}
                  {selectedTable?.id === table.id && (
                    <div className="absolute top-2 left-2 w-4 h-4 bg-neon-bright rounded-full flex items-center justify-center">
                      <span className="text-void-1000 text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

             {/* Table Information Modal */}
       {showTableInfo && selectedTable && (
         <ModalPortal>
           <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
             <div className="bg-[#0D0D1A] p-6 rounded-2xl shadow-lg max-w-lg w-full mx-4 animate-fade-in border-2 border-neon-bright">
               <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-3">
                   <span className="text-3xl">🏠</span>
                   <h3 className="text-2xl font-arcade font-black text-gold-bright">
                     Table {selectedTable.tableNumber} Details
                   </h3>
                 </div>
                 <button
                   onClick={() => setShowTableInfo(false)}
                   className="p-2 bg-void-800 hover:bg-void-700 text-danger-400 rounded-xl transition-all duration-300 text-xl font-bold hover:scale-110"
                 >
                   ✕
                 </button>
               </div>
              
                          <div className="space-y-4">
                 <div className="p-4 bg-void-800/50 rounded-xl border border-neon-bright/20">
                   <div className="flex items-center justify-between">
                     <span className="font-arcade font-bold text-neon-bright">Status:</span>
                     <span className={`px-3 py-2 rounded-xl text-sm font-arcade font-bold ${
                       getStatusStyle(selectedTable.status).bgColor
                     } text-white border-2 border-white/20`}>
                       {getStatusStyle(selectedTable.status).label}
                     </span>
                   </div>
                 </div>
                 
                 <div className="p-4 bg-void-800/50 rounded-xl border border-neon-bright/20">
                   <div className="flex items-center justify-between">
                     <span className="font-arcade font-bold text-neon-bright">Type:</span>
                     <span className={`px-3 py-2 rounded-xl text-sm font-arcade font-bold ${getTypeColor(selectedTable.type)}`}>
                       {selectedTable.type.toUpperCase()}
                     </span>
                   </div>
                 </div>
                 
                 
                 <div className="p-4 bg-void-800/50 rounded-xl border border-neon-bright/20">
                   <div className="flex items-center justify-between">
                     <span className="font-arcade font-bold text-neon-bright">Location:</span>
                     <span className="text-gold-bright font-arcade font-bold">{selectedTable.location}</span>
                   </div>
                 </div>
                 
                 {selectedTable.customerName && (
                   <div className="p-4 bg-danger-500/10 rounded-xl border border-danger-500/30">
                     <div className="flex items-center justify-between">
                       <span className="font-arcade font-bold text-danger-400">Customer:</span>
                       <span className="text-danger-400 font-arcade font-bold">{selectedTable.customerName}</span>
                     </div>
                   </div>
                 )}
                 
                 {selectedTable.startTime && (
                   <div className="p-4 bg-warning-500/10 rounded-xl border border-warning-500/30">
                     <div className="flex items-center justify-between">
                       <span className="font-arcade font-bold text-warning-400">Start Time:</span>
                       <span className="text-warning-400 font-arcade font-bold">
                         {new Date(selectedTable.startTime).toLocaleTimeString()}
                       </span>
                     </div>
                   </div>
                 )}
                 
                 {selectedTable.notes && (
                   <div className="p-4 bg-info-500/10 rounded-xl border border-info-500/30">
                     <div className="flex items-center justify-between">
                       <span className="font-arcade font-bold text-info-400">Notes:</span>
                       <span className="text-info-400 font-arcade font-bold">{selectedTable.notes}</span>
                     </div>
                   </div>
                 )}
               </div>
              
                          {/* Status Change Options */}
               <div className="mt-8 space-y-4">
                 <h4 className="font-arcade font-bold text-gold-bright text-center">Change Status:</h4>
                 <div className="grid grid-cols-3 gap-3">
                   {(['available', 'reserved', 'maintenance'] as TableStatus[]).map((status) => {
                     // Only disable if the table has an active session and we're trying to change from occupied
                     const hasActiveSession = selectedTable.currentSessionId && selectedTable.status === 'occupied';
                     const isValidChange = !hasActiveSession || status === 'occupied';
                     
                     return (
                       <button
                         key={status}
                         onClick={() => handleStatusChange(selectedTable.id, status)}
                         disabled={!isValidChange}
                         className={`px-4 py-3 rounded-xl text-sm font-arcade font-bold transition-all duration-300 transform hover:scale-105 ${
                           !isValidChange ? 'bg-gray-400 text-gray-200 cursor-not-allowed' :
                           status === 'available' ? 'bg-success-500 hover:bg-success-600 text-white border-2 border-success-400 shadow-lg' :
                           status === 'reserved' ? 'bg-warning-500 hover:bg-warning-600 text-white border-2 border-warning-400 shadow-lg' :
                           'bg-gray-500 hover:bg-gray-600 text-white border-2 border-gray-400 shadow-lg'
                         }`}
                         title={!isValidChange ? 'Cannot change status while session is active' : `Change to ${status}`}
                       >
                         {status === 'available' ? '🟢' : status === 'reserved' ? '🟡' : '⚫'} {status.charAt(0).toUpperCase() + status.slice(1)}
                       </button>
                     );
                   })}
                 </div>
                 {selectedTable.status === 'occupied' && (
                   <div className="text-center text-warning-400 font-arcade text-xs mt-2">
                     ⚠️ End the session first to change table status
                   </div>
                 )}
               </div>
             </div>
           </div>
         </ModalPortal>
       )}
    </div>
  );
};

export default TableGrid;
