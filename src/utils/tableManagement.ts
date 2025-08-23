import { Table, TableStatus } from '../types';

// Generate unique ID for tables
const generateTableId = (tableNumber: number): string => {
  return `table_${tableNumber.toString().padStart(2, '0')}`;
};

// Initialize 50 tables with default data
export const initializeTables = (): Table[] => {
  const tables: Table[] = [];
  const now = new Date().toISOString();
  
  for (let i = 1; i <= 50; i++) {
    // All tables are standard type
    const type: 'standard' | 'premium' | 'vip' = 'standard';
    
    // All tables have 4 people capacity
    const capacity = 4;
    
    // All tables are in Main Hall
    const location = 'Main Hall';
    
    const table: Table = {
      id: generateTableId(i),
      tableNumber: i,
      status: 'available',
      capacity,
      type,
      features: ['Standard Service'],
      location,
      notes: '',
      createdAt: now,
      lastUpdated: now
    };
    
    tables.push(table);
  }
  
  return tables;
};

// Get all tables
export const getAllTables = (): Table[] => {
  const tablesData = localStorage.getItem('tables');
  if (!tablesData) {
    console.log('No tables found in localStorage, initializing 50 tables...');
    const initialTables = initializeTables();
    localStorage.setItem('tables', JSON.stringify(initialTables));
    console.log('Tables initialized:', initialTables.length);
    return initialTables;
  }
  
  const parsedTables = JSON.parse(tablesData);
  console.log('Found tables in localStorage:', parsedTables.length);
  
  // If we don't have exactly 50 tables, reinitialize
  if (parsedTables.length !== 50) {
    console.log('Table count mismatch, reinitializing...');
    const initialTables = initializeTables();
    localStorage.setItem('tables', JSON.stringify(initialTables));
    return initialTables;
  }
  
  return parsedTables;
};

// Get available tables
export const getAvailableTables = (): Table[] => {
  const tables = getAllTables();
  return tables.filter(table => table.status === 'available');
};

// Get table by ID
export const getTableById = (tableId: string): Table | undefined => {
  const tables = getAllTables();
  return tables.find(table => table.id === tableId);
};

// Get table by number
export const getTableByNumber = (tableNumber: number): Table | undefined => {
  const tables = getAllTables();
  return tables.find(table => table.tableNumber === tableNumber);
};

// Update table status
export const updateTableStatus = (
  tableId: string, 
  status: TableStatus, 
  sessionId?: string, 
  customerName?: string,
  startTime?: string
): void => {
  const tables = getAllTables();
  const tableIndex = tables.findIndex(table => table.id === tableId);
  
  if (tableIndex !== -1) {
    tables[tableIndex] = {
      ...tables[tableIndex],
      status,
      currentSessionId: sessionId,
      customerName,
      startTime,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('tables', JSON.stringify(tables));
  }
};

// Reserve table
export const reserveTable = (tableId: string, customerName: string, startTime: string): void => {
  updateTableStatus(tableId, 'reserved', undefined, customerName, startTime);
};

// Occupy table (start session)
export const occupyTable = (tableId: string, sessionId: string, customerName: string, startTime: string): void => {
  updateTableStatus(tableId, 'occupied', sessionId, customerName, startTime);
};

// Free table (end session)
export const freeTable = (tableId: string): void => {
  updateTableStatus(tableId, 'available');
};

// Set table maintenance
export const setTableMaintenance = (tableId: string, notes?: string): void => {
  const tables = getAllTables();
  const tableIndex = tables.findIndex(table => table.id === tableId);
  
  if (tableIndex !== -1) {
    tables[tableIndex] = {
      ...tables[tableIndex],
      status: 'maintenance',
      notes: notes || 'Table under maintenance',
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('tables', JSON.stringify(tables));
  }
};

// Get table statistics
export const getTableStats = () => {
  const tables = getAllTables();
  return {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length
  };
};

// Check if table is available for session
export const isTableAvailableForSession = (tableId: string, requiredCapacity: number): boolean => {
  const table = getTableById(tableId);
  if (!table) return false;
  
  return table.status === 'available' && table.capacity >= requiredCapacity;
};

// Get tables by capacity range
export const getTablesByCapacity = (minCapacity: number, maxCapacity?: number): Table[] => {
  const tables = getAllTables();
  return tables.filter(table => {
    if (maxCapacity) {
      return table.capacity >= minCapacity && table.capacity <= maxCapacity;
    }
    return table.capacity >= minCapacity;
  });
};

// Reset all tables to available (useful for testing)
export const resetAllTables = (): void => {
  const tables = initializeTables();
  localStorage.setItem('tables', JSON.stringify(tables));
};

// Enhanced validation functions
export const validateTableAssignment = (tableId: string, requiredCapacity: number, sessionId?: string): {
  isValid: boolean;
  error?: string;
} => {
  const table = getTableById(tableId);
  
  if (!table) {
    return { isValid: false, error: 'Table not found' };
  }
  
  if (table.status === 'maintenance') {
    return { isValid: false, error: 'Table is under maintenance' };
  }
  
  if (table.status === 'reserved') {
    return { isValid: false, error: 'Table is reserved' };
  }
  
  if (table.status === 'occupied' && table.currentSessionId !== sessionId) {
    return { isValid: false, error: 'Table is already occupied by another session' };
  }
  
  if (table.capacity < requiredCapacity) {
    return { isValid: false, error: `Table capacity (${table.capacity}) is insufficient for ${requiredCapacity} people` };
  }
  
  return { isValid: true };
};

// Check for table conflicts
export const checkTableConflicts = (tableId: string, sessionId: string): {
  hasConflict: boolean;
  conflictDetails?: string;
} => {
  const table = getTableById(tableId);
  
  if (!table) {
    return { hasConflict: true, conflictDetails: 'Table not found' };
  }
  
  // Check if table is occupied by another session
  if (table.status === 'occupied' && table.currentSessionId && table.currentSessionId !== sessionId) {
    return { 
      hasConflict: true, 
      conflictDetails: `Table is occupied by session ${table.currentSessionId}` 
    };
  }
  
  // Check if table is reserved
  if (table.status === 'reserved') {
    return { 
      hasConflict: true, 
      conflictDetails: 'Table is reserved' 
    };
  }
  
  // Check if table is in maintenance
  if (table.status === 'maintenance') {
    return { 
      hasConflict: true, 
      conflictDetails: 'Table is under maintenance' 
    };
  }
  
  return { hasConflict: false };
};

// Get optimal table for a group
export const getOptimalTable = (requiredCapacity: number, preferredType?: 'standard' | 'premium' | 'vip'): Table | null => {
  const availableTables = getAvailableTables().filter(table => table.capacity >= requiredCapacity);
  
  if (availableTables.length === 0) return null;
  
  // If preferred type is specified, prioritize it
  if (preferredType) {
    const preferredTables = availableTables.filter(table => table.type === preferredType);
    if (preferredTables.length > 0) {
      // Return the table with the closest capacity match
      return preferredTables.reduce((best, current) => 
        Math.abs(current.capacity - requiredCapacity) < Math.abs(best.capacity - requiredCapacity) ? current : best
      );
    }
  }
  
  // Return the table with the closest capacity match
  return availableTables.reduce((best, current) => 
    Math.abs(current.capacity - requiredCapacity) < Math.abs(best.capacity - requiredCapacity) ? current : best
  );
};

// Schedule table maintenance
export const scheduleTableMaintenance = (tableId: string, startTime: string, endTime: string, reason: string): void => {
  const tables = getAllTables();
  const tableIndex = tables.findIndex(table => table.id === tableId);
  
  if (tableIndex !== -1) {
    tables[tableIndex] = {
      ...tables[tableIndex],
      status: 'maintenance',
      notes: `Maintenance: ${reason} (${startTime} - ${endTime})`,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('tables', JSON.stringify(tables));
  }
};
