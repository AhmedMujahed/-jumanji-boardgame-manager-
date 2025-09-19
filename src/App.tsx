import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { User, Customer, Session, Game, Payment, Table, Reservation, ActivityLog, TableStatus, Promotion, PromotionHistoryEntry } from './types';
import { getAllTables, validateTableAssignment, checkTableConflicts } from './utils/tableManagement';
import { initRealtime, startPresence, notifyAll } from './realtime';
import { watchSessions } from './realtimeDb';

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

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('promotions');
    return saved ? JSON.parse(saved) : [];
  });

  const [promoHistory, setPromoHistory] = useState<PromotionHistoryEntry[]>(() => {
    const saved = localStorage.getItem('promoHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const savedTables = localStorage.getItem('tables');
    if (savedTables) {
      const parsedTables = JSON.parse(savedTables);
      // Ensure we have exactly 15 tables
      if (parsedTables.length === 15) {
        return parsedTables;
      }
    }
    // Initialize tables if none exist or if count is wrong
    const initialTables = getAllTables();
    return initialTables;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const savedReservations = localStorage.getItem('reservations');
    return savedReservations ? JSON.parse(savedReservations) : [];
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const savedLogs = localStorage.getItem('logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        // Check for duplicate IDs and filter them out
        const uniqueLogs = parsedLogs.filter((log: ActivityLog, index: number, arr: ActivityLog[]) => 
          arr.findIndex(l => l.id === log.id) === index
        );
        
        // If we found duplicates, update localStorage
        if (uniqueLogs.length !== parsedLogs.length) {
          localStorage.setItem('logs', JSON.stringify(uniqueLogs));
        }
        
        return uniqueLogs;
      } catch (error) {
        console.error('Error parsing logs from localStorage:', error);
        return [];
      }
    }
    return [];
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
    localStorage.setItem('promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('promoHistory', JSON.stringify(promoHistory));
  }, [promoHistory]);

  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  // Initialize tables if they don't exist
  useEffect(() => {
    if (tables.length === 0) {
      const initialTables = getAllTables();
      setTables(initialTables);
    }
  }, [tables.length]);

  // Logging function
  const addLog = (type: ActivityLog['type'], action: string, details: string) => {
    if (!user) return;
    
    // Create a unique ID using timestamp + random number to avoid duplicates
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newLog: ActivityLog = {
      id: uniqueId,
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
    // Persist minimal identity for realtime presence/filters
    localStorage.setItem('username', userData.username);
    localStorage.setItem('role', userData.role === 'owner' ? 'owner' : 'gm');
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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCustomer]);
    // Broadcast customer add
    notifyAll('customer:update', { action: 'add', customer: newCustomer });
    addLog('customer_add', 'Customer Added', `Added customer: ${customerData.name} (${customerData.email})`);
  };

  const updateCustomer = (customerId: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updates } : c));
    const updated = customers.find(c => c.id === customerId);
    addLog('customer_edit', 'Customer Updated', `Updated customer: ${updated?.name || 'Unknown'}`);
  };

  const deleteCustomer = (customerId: string) => {
    const removed = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    addLog('customer_delete', 'Customer Deleted', `Deleted customer: ${removed?.name || 'Unknown'}`);
  };

  const addSession = (sessionData: Omit<Session, 'id' | 'startTime' | 'status' | 'totalCost' | 'hours'>) => {
    // Validate table assignment before creating session
    if (sessionData.tableId) {
      const validation = validateTableAssignment(sessionData.tableId, sessionData.capacity);
      if (!validation.isValid) {
        alert(`Cannot start session: ${validation.error}`);
        return;
      }
      
      // Check for conflicts
      const conflictCheck = checkTableConflicts(sessionData.tableId, '');
      if (conflictCheck.hasConflict) {
        alert(`Table conflict: ${conflictCheck.conflictDetails}`);
        return;
      }
    }
    
    // Auto-apply active promotion if any (not optional)
    const now = new Date();
    const activePromo = promotions.find(p => p.isActive && (!p.startDate || new Date(p.startDate) <= now) && (!p.endDate || new Date(p.endDate) >= now));

    const newSession: Session = {
      ...sessionData,
      promoId: activePromo?.id,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      status: 'active',
      totalCost: 0,
      hours: 0
    };
    setSessions(prev => [...prev, newSession]);
    // Broadcast to all clients with full payload
    notifyAll('session:update', { action: 'add', session: newSession });
    
    // Update table status to occupied
    if (sessionData.tableId) {
      const customer = customers.find(c => c.id === sessionData.customerId);
      updateTable(sessionData.tableId, {
        status: 'occupied',
        currentSessionId: newSession.id,
        customerName: customer?.name || 'Unknown',
        startTime: newSession.startTime
      });
    }
    
    const customer = customers.find(c => c.id === sessionData.customerId);
                 addLog('session_start', 'Session Started', `Started session for customer: ${customer?.name || 'Unknown'} - ${sessionData.capacity} people (${sessionData.genderBreakdown?.male || 0}M, ${sessionData.genderBreakdown?.female || 0}F) - Table ${sessionData.tableNumber || sessionData.tableId} - ${sessionData.notes || 'No notes'}${activePromo ? ` • Promo: ${activePromo.name}` : ''}`);
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
    // Broadcast updates
    notifyAll('session:update', { action: 'update', sessionId, updates });
  };

  const endSession = (sessionId: string, paymentDetails: { method: 'cash' | 'card' | 'mixed'; cashAmount: number; cardAmount: number; totalPaid: number }) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const endTime = new Date();
        const startTime = new Date(session.startTime);
        const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        // Compute pricing: apply promotion if selected
        let totalCost = 0;
        const firstHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.firstHourPrice || 30) : 30;
        const extraHourPrice = session.promoId ? (promotions.find(p => p.id === session.promoId)?.extraHourPrice || 30) : 30;
        
        if (totalMinutes < 30) {
          totalCost = 0;
        } else if (totalMinutes < 90) { // 30min to 1h30min
          totalCost = firstHourPrice * session.capacity;
        } else {
          // After 1h30min: first hour + extra hours (every hour from 1h30min)
          const extraHours = Math.floor((totalMinutes - 90) / 60) + 1;
          totalCost = (firstHourPrice + (extraHours * extraHourPrice)) * session.capacity;
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
    if (session && session.tableId) {
      // Free the table when session ends
      updateTable(session.tableId, {
        status: 'available',
        currentSessionId: undefined,
        customerName: undefined,
        startTime: undefined
      });
    }
    
    const customer = customers.find(c => c.id === session?.customerId);
    
    // Create payment record
    if (session && paymentDetails.totalPaid > 0) {
      addPayment({
        sessionId: sessionId,
        customerId: session.customerId,
        amount: paymentDetails.totalPaid,
        method: paymentDetails.method,
        status: 'completed',
        createdAt: new Date().toISOString(),
        cashAmount: paymentDetails.cashAmount,
        cardAmount: paymentDetails.cardAmount,
        onlineAmount: 0
      });
    }
    
    addLog('session_end', 'Session Ended', `Ended session for customer: ${customer?.name || 'Unknown'} - ${session?.capacity || 0} people - Duration: ${session?.hours || 0}h, Cost: ${session?.totalCost || 0} SAR`);
    // Broadcast completion
    notifyAll('session:update', { action: 'end', sessionId });
  };

  // New handlers for the 4 features
  const addGame = (gameData: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...gameData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setGames(prev => [...prev, newGame]);
    // Broadcast game add
    notifyAll('game:update', { action: 'add', game: newGame });
    addLog('game_add', 'Game Added', `Added game: ${gameData.name} (${gameData.category})`);
  };

  // Promotions handlers
  const addPromotion = (data: Omit<Promotion, 'id' | 'createdAt'>) => {
    const promo: Promotion = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setPromotions(prev => [promo, ...prev]);
    addLog('system_action', 'Promotion Added', `Added promo: ${data.name}`);
    setPromoHistory(prev => [{ id: `${Date.now()}`, promotionId: promo.id, promotionName: promo.name, action: 'created', timestamp: new Date().toISOString() }, ...prev]);
  };

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const p = promotions.find(pr => pr.id === id);
    addLog('system_action', 'Promotion Updated', `Updated promo: ${p?.name || id}`);
    setPromoHistory(prev => [{ id: `${Date.now()}`, promotionId: id, promotionName: p?.name || id, action: updates.isActive !== undefined ? (updates.isActive ? 'activated' : 'disabled') : 'updated', timestamp: new Date().toISOString(), metadata: updates as any }, ...prev]);
  };

  const deletePromotion = (id: string) => {
    const p = promotions.find(pr => pr.id === id);
    setPromotions(prev => prev.filter(pr => pr.id !== id));
    addLog('system_action', 'Promotion Deleted', `Deleted promo: ${p?.name || id}`);
    setPromoHistory(prev => [{ id: `${Date.now()}`, promotionId: id, promotionName: p?.name || id, action: 'deleted', timestamp: new Date().toISOString() }, ...prev]);
  };

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(game => 
      game.id === gameId ? { ...game, ...updates } : game
    ));
    
    const game = games.find(g => g.id === gameId);
    addLog('game_edit', 'Game Updated', `Updated game: ${game?.name || 'Unknown'} - ${Object.keys(updates).join(', ')}`);
    // Broadcast game update
    notifyAll('game:update', { action: 'update', gameId, updates });
  };

  const deleteGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    setGames(prev => prev.filter(game => game.id !== gameId));
    // Broadcast game delete
    notifyAll('game:update', { action: 'delete', gameId });
    addLog('game_delete', 'Game Deleted', `Deleted game: ${game?.name || 'Unknown'}`);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setPayments(prev => [...prev, newPayment]);
    // Broadcast payment add
    notifyAll('payment:update', { action: 'add', payment: newPayment });
    
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
    // Broadcast payment update
    notifyAll('payment:update', { action: 'update', paymentId, updates });
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    // Broadcast payment delete
    notifyAll('payment:update', { action: 'delete', paymentId });
    addLog('payment_delete', 'Payment Deleted', `Deleted payment: ${payment?.amount || 0} SAR`);
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    setTables(prev => [...prev, newTable]);
    // Broadcast table add
    notifyAll('table:update', { action: 'add', table: newTable });
    addLog('table_add', 'Table Added', `Added table: ${tableData.tableNumber} (${tableData.tableNumber})`);
  };

  const updateTable = (tableId: string, updates: Partial<Table>) => {
    setTables(prev => {
      const updatedTables = prev.map(table => 
        table.id === tableId ? { ...table, ...updates, lastUpdated: new Date().toISOString() } : table
      );
      
      // Save to local storage immediately
      localStorage.setItem('tables', JSON.stringify(updatedTables));
      
      // Find the updated table for logging
      const updatedTable = updatedTables.find(t => t.id === tableId);
      addLog('table_edit', 'Table Updated', `Updated table: ${updatedTable?.tableNumber || 'Unknown'} - ${Object.keys(updates).join(', ')}`);
      // Broadcast table update
      notifyAll('table:update', { action: 'update', tableId, updates });
      
      return updatedTables;
    });
  };

  // Handle table status change specifically
  const handleTableStatusChange = (tableId: string, newStatus: TableStatus) => {
    updateTable(tableId, { status: newStatus });
  };

  // Force refresh tables (reinitialize all 15 tables)
  const handleRefreshTables = () => {
    // Force clear localStorage and reinitialize all tables
    localStorage.removeItem('tables');
    
    // Also clear logs to prevent duplicate key issues
    localStorage.removeItem('logs');
    setLogs([]);
    
    const initialTables = getAllTables();
    setTables(initialTables);
    
    // Add a fresh log entry
    if (user) {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const refreshLog: ActivityLog = {
        id: uniqueId,
        type: 'table_refresh',
        userId: user.id,
        userName: user.username,
        userRole: user.role,
        action: 'Tables Refreshed',
        details: 'All 15 tables have been reinitialized',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent
      };
      setLogs([refreshLog]);
    }
  };

  const deleteTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    setTables(prev => prev.filter(table => table.id !== tableId));
    // Broadcast table delete
    notifyAll('table:update', { action: 'delete', tableId });
    addLog('table_delete', 'Table Deleted', `Deleted table: ${table?.tableNumber || 'Unknown'}`);
  };

  const addReservation = (reservationData: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setReservations(prev => [...prev, newReservation]);
    // Broadcast reservation add
    notifyAll('reservation:update', { action: 'add', reservation: newReservation });
    
    const table = tables.find(t => t.id === reservationData.tableId);
    const customer = customers.find(c => c.id === reservationData.customerId);
    addLog('reservation_add', 'Reservation Added', `Added reservation: Table ${table?.tableNumber || 'Unknown'} for customer: ${customer?.name || 'Unknown'} - ${reservationData.partySize} people`);
  };

  const updateReservation = (reservationId: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === reservationId ? { ...reservation, ...updates } : reservation
    ));
    
    const reservation = reservations.find(r => r.id === reservationId);
    addLog('reservation_edit', 'Reservation Updated', `Updated reservation: ${Object.keys(updates).join(', ')}`);
    // Broadcast reservation update
    notifyAll('reservation:update', { action: 'update', reservationId, updates });
  };

  const deleteReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    setReservations(prev => prev.filter(reservation => reservation.id !== reservationId));
    // Broadcast reservation delete
    notifyAll('reservation:update', { action: 'delete', reservationId });
    addLog('reservation_delete', 'Reservation Deleted', `Deleted reservation for customer: ${customers.find(c => c.id === reservation?.customerId)?.name || 'Unknown'}`);
  };

  // Clear all logs to resolve duplicate key issues
  const clearAllLogs = () => {
    localStorage.removeItem('logs');
    setLogs([]);
    if (user) {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const clearLog: ActivityLog = {
        id: uniqueId,
        type: 'system_action',
        userId: user.id,
        userName: user.username,
        userRole: user.role,
        action: 'Logs Cleared',
        details: 'All activity logs have been cleared',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent
      };
      setLogs([clearLog]);
    }
  };

  // Realtime wiring
  useEffect(() => {
    if (!user) return;
    const role = (localStorage.getItem('role') || 'gm') as 'owner' | 'gm';
    const userId = localStorage.getItem('username') || user.username || 'anon';

    initRealtime((evt) => {
      if (evt.type === 'analytics:update' && role !== 'owner') return;
      if (evt.type === 'session:update') {
        const payload: any = evt.payload || {};
        if (payload.action === 'add' && payload.session) {
          setSessions(prev => prev.some(s => s.id === payload.session.id) ? prev : [payload.session, ...prev]);
        } else if (payload.action === 'update' && payload.sessionId) {
          setSessions(prev => prev.map(s => s.id === payload.sessionId ? { ...s, ...(payload.updates || {}) } : s));
        } else if (payload.action === 'end' && payload.sessionId) {
          setSessions(prev => prev.map(s => s.id === payload.sessionId ? { ...s, status: 'completed' } : s));
        }
      } else if (evt.type === 'customer:update') {
        const p: any = evt.payload || {};
        if (p.action === 'add' && p.customer) {
          setCustomers(prev => prev.some(c => c.id === p.customer.id) ? prev : [...prev, p.customer]);
        }
      } else if (evt.type === 'game:update') {
        const p: any = evt.payload || {};
        if (p.action === 'add' && p.game) {
          setGames(prev => prev.some(g => g.id === p.game.id) ? prev : [...prev, p.game]);
        } else if (p.action === 'update' && p.gameId) {
          setGames(prev => prev.map(g => g.id === p.gameId ? { ...g, ...(p.updates || {}) } : g));
        } else if (p.action === 'delete' && p.gameId) {
          setGames(prev => prev.filter(g => g.id !== p.gameId));
        }
      } else if (evt.type === 'payment:update') {
        const p: any = evt.payload || {};
        if (p.action === 'add' && p.payment) {
          setPayments(prev => prev.some(pm => pm.id === p.payment.id) ? prev : [...prev, p.payment]);
        } else if (p.action === 'update' && p.paymentId) {
          setPayments(prev => prev.map(pm => pm.id === p.paymentId ? { ...pm, ...(p.updates || {}) } : pm));
        } else if (p.action === 'delete' && p.paymentId) {
          setPayments(prev => prev.filter(pm => pm.id !== p.paymentId));
        }
      } else if (evt.type === 'table:update') {
        const p: any = evt.payload || {};
        if (p.action === 'add' && p.table) {
          setTables(prev => prev.some(t => t.id === p.table.id) ? prev : [...prev, p.table]);
        } else if (p.action === 'update' && p.tableId) {
          setTables(prev => prev.map(t => t.id === p.tableId ? { ...t, ...(p.updates || {}) } : t));
        } else if (p.action === 'delete' && p.tableId) {
          setTables(prev => prev.filter(t => t.id !== p.tableId));
        }
      } else if (evt.type === 'reservation:update') {
        const p: any = evt.payload || {};
        if (p.action === 'add' && p.reservation) {
          setReservations(prev => prev.some(r => r.id === p.reservation.id) ? prev : [...prev, p.reservation]);
        } else if (p.action === 'update' && p.reservationId) {
          setReservations(prev => prev.map(r => r.id === p.reservationId ? { ...r, ...(p.updates || {}) } : r));
        } else if (p.action === 'delete' && p.reservationId) {
          setReservations(prev => prev.filter(r => r.id !== p.reservationId));
        }
      }
    });

    startPresence(userId, role);
    const sub = watchSessions(() => {
      // Hook for durable DB changes. In a future step, refetch sessions from API.
    });

    return () => {
      // Best-effort unsubscribe if available
      // @ts-ignore - supabase channel returns object with unsubscribe in v2
      sub?.unsubscribe && sub.unsubscribe();
    };
  }, [user]);

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
      promotions={promotions}
      tables={tables}
      reservations={reservations}
      logs={logs}
      onLogout={handleLogout}
      onAddCustomer={addCustomer}
      onUpdateCustomer={updateCustomer}
      onDeleteCustomer={deleteCustomer}
      onAddSession={addSession}
      onUpdateSession={updateSession}
      onEndSession={endSession}
      onAddGame={addGame}
      onUpdateGame={updateGame}
      onDeleteGame={deleteGame}
      onAddPayment={addPayment}
      onUpdatePayment={updatePayment}
      onAddTable={addTable}
      onUpdateTable={updateTable}
      onDeleteTable={deleteTable}
      onTableStatusChange={handleTableStatusChange}
      onRefreshTables={handleRefreshTables}
      onAddReservation={addReservation}
      onUpdateReservation={updateReservation}
      onDeleteReservation={deleteReservation}
      onClearAllLogs={clearAllLogs}
      onAddPromotion={addPromotion}
      onUpdatePromotion={updatePromotion}
      onDeletePromotion={deletePromotion}
    />
  );
};

export default App;
