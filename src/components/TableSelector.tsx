import React, { useState, useEffect } from 'react';
import { Table } from '../types';
import { getAvailableTables, validateTableAssignment, checkTableConflicts } from '../utils/tableManagement';

interface TableSelectorProps {
  selectedTableId: string;
  onTableSelect: (tableId: string, tableNumber: number) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  selectedTableId,
  onTableSelect
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  
  // Update available tables
  useEffect(() => {
    const tables = getAvailableTables();
    setAvailableTables(tables);
    
    // Clear validation error
    setValidationError(null);
  }, []);
  
  // Validate table selection
  const handleTableSelection = (tableId: string, tableNumber: number) => {
    // Clear previous validation errors
    setValidationError(null);
    
    // Validate the table assignment (no capacity check needed)
    const validation = validateTableAssignment(tableId, 1);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid table selection');
      return;
    }
    
    // Check for conflicts
    const conflictCheck = checkTableConflicts(tableId, '');
    if (conflictCheck.hasConflict) {
      setValidationError(conflictCheck.conflictDetails || 'Table conflict detected');
      return;
    }
    
    // If validation passes, select the table
    onTableSelect(tableId, tableNumber);
  };

  const getTableTypeColor = (type: string) => {
    switch (type) {
      case 'vip':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-lg';
      case 'premium':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg';
      case 'standard':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400 shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400 shadow-lg';
    }
  };

  if (availableTables.length === 0) {
    return (
      <div className="p-4 bg-danger-500/10 border-2 border-danger-500/30 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-danger-400 font-arcade font-bold text-sm">
            No available tables
          </p>
          <p className="text-danger-400/70 font-arcade text-xs mt-1">
            Please wait for tables to become available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <label className="block text-lg font-arcade font-bold text-gold-bright mb-2">
          🏠 Select Table
        </label>
        <p className="text-neon-bright/70 font-arcade text-sm">
          {availableTables.length} tables available
        </p>
      </div>
      
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {availableTables.map((table) => (
           <button
             key={table.id}
             type="button"
             onClick={() => handleTableSelection(table.id, table.tableNumber)}
             className={`
               p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105
               ${selectedTableId === table.id
                 ? 'border-neon-bright bg-neon-bright/10 shadow-neon-lg'
                 : 'border-neon-bright/30 hover:border-neon-bright/60 hover:bg-neon-bright/5'
               }
             `}
           >
            <div className="flex items-center justify-between mb-3">
              <span className="font-arcade font-black text-xl text-gold-bright">Table {table.tableNumber}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-arcade font-bold border-2 ${getTableTypeColor(table.type)}`}>
                {table.type.toUpperCase()}
              </span>
            </div>
            <div className="text-neon-bright/80 font-arcade text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>{table.location}</span>
              </div>
            </div>
            {selectedTableId === table.id && (
              <div className="mt-3 p-2 bg-success-500/20 border border-success-500/30 rounded-lg">
                <div className="text-success-400 font-arcade font-bold text-sm text-center">
                  ✅ SELECTED
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      
             {/* Validation Error Display */}
       {validationError && (
         <div className="p-4 bg-danger-500/10 border-2 border-danger-500/30 rounded-xl">
           <div className="text-center">
             <div className="text-4xl mb-2">⚠️</div>
             <p className="text-danger-400 font-arcade font-bold text-sm">
               Table Selection Error
             </p>
             <p className="text-danger-400/70 font-arcade text-xs mt-1">
               {validationError}
             </p>
           </div>
         </div>
       )}
       
       {selectedTableId && !validationError && (
         <div className="p-4 bg-success-500/10 border-2 border-success-500/30 rounded-xl">
           <div className="text-center">
             <div className="text-2xl mb-2">🎯</div>
             <p className="text-success-400 font-arcade font-bold text-sm">
               Table selected successfully!
             </p>
             <p className="text-success-400/70 font-arcade text-xs mt-1">
               You can now start the session
             </p>
           </div>
         </div>
       )}
    </div>
  );
};

export default TableSelector;
