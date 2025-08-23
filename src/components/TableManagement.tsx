import React from 'react';
import { Table, Reservation, Customer, Session } from '../types';
import TableGrid from './TableGrid';

interface TableManagementProps {
  tables: Table[];
  reservations: Reservation[];
  customers: Customer[];
  sessions: Session[];
  onAddTable: (table: Omit<Table, 'id'>) => void;
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void;
  onDeleteTable: (tableId: string) => void;
  onTableStatusChange: (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'maintenance') => void;
  onAddReservation: (reservation: Omit<Reservation, 'id'>) => void;
  onUpdateReservation: (reservationId: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (reservationId: string) => void;
  onRefreshTables?: () => void;
}

const TableManagement: React.FC<TableManagementProps> = ({
  tables,
  onTableStatusChange,
  onRefreshTables
}) => {
  return (
    <div className="w-full">
      {/* Table Grid - Full width */}
      <TableGrid 
        tables={tables}
        onTableStatusChange={onTableStatusChange}
        onRefreshTables={onRefreshTables}
      />
    </div>
  );
};

export default TableManagement;
