import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { User, Customer, Session, Game, Payment, Table, Reservation, ActivityLog } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const savedCustomers = localStorage.getItem('customers');
    return savedCustomers ? JSON.parse(savedCustomers) : [];
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const savedSessions = localStorage.getItem('sessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  // New state for the 4 features
  const [games, setGames] = useState<Game[]>(() => {
    const savedGames = localStorage.getItem('games');
    return savedGames ? JSON.parse(savedGames) : [];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const savedPayments = localStorage.getItem('payments');
    return savedPayments ? JSON.parse(savedPayments) : [];
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const savedTables = localStorage.getItem('tables');
    return savedTables ? JSON.parse(savedTables) : [];
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const savedReservations = localStorage.getItem('reservations');
    return savedReservations ? JSON.parse(savedReservations) : [];
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const savedLogs = localStorage.getItem('logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  // Logging function
  const addLog = (type: ActivityLog['type'], action: string, details: string) => {
    if (!user) return;
    
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type,
      userId: user.id,
      userName: user.username,
      userRole: user.role,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In a real app, this would come from the request
      userAgent: navigator.userAgent
    };
    
    setLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    addLog('user_login', 'User Login', `User ${userData.username} (${userData.role}) logged in`);
  };

  const handleLogout = () => {
    if (user) {
      addLog('user_logout', 'User Logout', `User ${user.username} (${user.role}) logged out`);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCustomer]);
    addLog('customer_add', 'Customer Added', `Added customer: ${customerData.name} (${customerData.email})`);
  };

  const addSession = (sessionData: Omit<Session, 'id' | 'startTime' | 'status' | 'totalCost' | 'hours'>) => {
    const newSession: Session = {
      ...sessionData,
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      status: 'active',
      totalCost: 0,
      hours: 0
    };
    setSessions(prev => [...prev, newSession]);
    
    const customer = customers.find(c => c.id === sessionData.customerId);
    addLog('session_start', 'Session Started', `Started session for customer: ${customer?.name || 'Unknown'} - ${sessionData.capacity} people (${sessionData.genderBreakdown.male}M, ${sessionData.genderBreakdown.female}F) - Table ${sessionData.tableId} - ${sessionData.notes || 'No notes'}`);
  };

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, ...updates } : session
    ));
    
    if (updates.status) {
      const session = sessions.find(s => s.id === sessionId);
      const customer = customers.find(c => c.id === session?.customerId);
      addLog('session_edit', 'Session Updated', `Updated session status to ${updates.status} for customer: ${customer?.name || 'Unknown'}`);
    }
  };

  const endSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const endTime = new Date();
        const startTime = new Date(session.startTime);
        const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        // First 30 minutes = 30 SAR, then every hour after that
        let totalCost = 0;
        if (totalMinutes <= 30) {
          totalCost = 30 * session.capacity; // First 30 min
        } else {
          const hoursAfter30Min = Math.ceil((totalMinutes - 30) / 60); // Hours after first 30 min
          totalCost = (30 + (hoursAfter30Min * 30)) * session.capacity; // 30 SAR + hourly rate
        }
        
        const hours = Math.max(0.5, Math.round(totalMinutes / 60 * 10) / 10); // Round to 1 decimal
        
        return {
          ...session,
          endTime: endTime.toISOString(),
          status: 'completed',
          hours,
          totalCost
        };
      }
      return session;
    }));
    
    const session = sessions.find(s => s.id === sessionId);
    const customer = customers.find(c => c.id === session?.customerId);
    addLog('session_end', 'Session Ended', `Ended session for customer: ${customer?.name || 'Unknown'} - ${session?.capacity || 0} people - Duration: ${session?.hours || 0}h, Cost: ${session?.totalCost || 0} SAR`);
  };

  // New handlers for the 4 features
  const addGame = (gameData: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...gameData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setGames(prev => [...prev, newGame]);
    addLog('game_add', 'Game Added', `Added game: ${gameData.name} (${gameData.category})`);
  };

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(game => 
      game.id === gameId ? { ...game, ...updates } : game
    ));
    
    const game = games.find(g => g.id === gameId);
    addLog('game_edit', 'Game Updated', `Updated game: ${game?.name || 'Unknown'} - ${Object.keys(updates).join(', ')}`);
  };

  const deleteGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    setGames(prev => prev.filter(game => game.id !== gameId));
    addLog('game_delete', 'Game Deleted', `Deleted game: ${game?.name || 'Unknown'}`);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString()
    };
    setPayments(prev => [...prev, newPayment]);
    
    const session = sessions.find(s => s.id === paymentData.sessionId);
    const customer = customers.find(c => c.id === session?.customerId);
    
    let paymentDetails = `${paymentData.amount} SAR (${paymentData.method})`;
    if (paymentData.method === 'mixed') {
      paymentDetails = `${paymentData.amount} SAR - Cash: ${paymentData.cashAmount || 0} SAR, Card: ${paymentData.cardAmount || 0} SAR, Online: ${paymentData.onlineAmount || 0} SAR`;
    }
    
    addLog('payment_add', 'Payment Added', `Added payment: ${paymentDetails} for customer: ${customer?.name || 'Unknown'}`);
  };

  const updatePayment = (paymentId: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, ...updates } : payment
    ));
    
    const payment = payments.find(p => p.id === paymentId);
    addLog('payment_edit', 'Payment Updated', `Updated payment: ${payment?.amount || 0} SAR - ${Object.keys(updates).join(', ')}`);
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    addLog('payment_delete', 'Payment Deleted', `Deleted payment: ${payment?.amount || 0} SAR`);
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTables(prev => [...prev, newTable]);
    addLog('table_add', 'Table Added', `Added table: ${tableData.name} (${tableData.type}) - Capacity: ${tableData.capacity}`);
  };

  const updateTable = (tableId: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, ...updates } : table
    ));
    
    const table = tables.find(t => t.id === tableId);
    addLog('table_edit', 'Table Updated', `Updated table: ${table?.name || 'Unknown'} - ${Object.keys(updates).join(', ')}`);
  };

  const deleteTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    setTables(prev => prev.filter(table => table.id !== tableId));
    addLog('table_delete', 'Table Deleted', `Deleted table: ${table?.name || 'Unknown'}`);
  };

  const addReservation = (reservationData: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setReservations(prev => [...prev, newReservation]);
    
    const table = tables.find(t => t.id === reservationData.tableId);
    const customer = customers.find(c => c.id === reservationData.customerId);
    addLog('reservation_add', 'Reservation Added', `Added reservation: Table ${table?.name || 'Unknown'} for customer: ${customer?.name || 'Unknown'} - ${reservationData.partySize} people`);
  };

  const updateReservation = (reservationId: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === reservationId ? { ...reservation, ...updates } : reservation
    ));
    
    const reservation = reservations.find(r => r.id === reservationId);
    addLog('reservation_edit', 'Reservation Updated', `Updated reservation: ${Object.keys(updates).join(', ')}`);
  };

  const deleteReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    setReservations(prev => prev.filter(reservation => reservation.id !== reservationId));
    addLog('reservation_delete', 'Reservation Deleted', `Deleted reservation for customer: ${customers.find(c => c.id === reservation?.customerId)?.name || 'Unknown'}`);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      customers={customers}
      sessions={sessions}
      games={games}
      payments={payments}
      tables={tables}
      reservations={reservations}
      logs={logs}
      onLogout={handleLogout}
      onAddCustomer={addCustomer}
      onAddSession={addSession}
      onUpdateSession={updateSession}
      onEndSession={endSession}
      onAddGame={addGame}
      onUpdateGame={updateGame}
      onDeleteGame={deleteGame}
      onAddPayment={addPayment}
      onUpdatePayment={updatePayment}
      onDeletePayment={deletePayment}
      onAddTable={addTable}
      onUpdateTable={updateTable}
      onDeleteTable={deleteTable}
      onAddReservation={addReservation}
      onUpdateReservation={updateReservation}
      onDeleteReservation={deleteReservation}
    />
  );
};

export default App;
