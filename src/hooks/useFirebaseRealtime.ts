import { useState, useEffect, useCallback } from 'react';
import {
  customersService,
  sessionsService,
  activityLogsService,
  paymentsService,
  gamesService,
  tablesService,
  reservationsService,
  promotionsService,
  BoardGameFirebaseService,
  listenToBroadcasts
} from '../lib/firebase-realtime';
import {
  Customer,
  Session,
  ActivityLog,
  Payment,
  Game,
  Table,
  Reservation,
  Promotion
} from '../types';

// Generic hook for real-time data
function useRealtimeData<T>(
  service: { getAll: (callback: (data: T[]) => void) => () => void }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = service.getAll((newData) => {
      setData(newData);
      setLoading(false);
    });

    return unsubscribe;
  }, [service]);

  return { data, loading, error, setError };
}

// Hook for customers with real-time updates
export function useCustomers() {
  const result = useRealtimeData(customersService);
  
  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const id = await customersService.create(customerData);
      return id;
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to add customer');
      throw error;
    }
  }, [result]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      await customersService.update(id, updates);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to update customer');
      throw error;
    }
  }, [result]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await customersService.delete(id);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to delete customer');
      throw error;
    }
  }, [result]);

  return {
    ...result,
    customers: result.data,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}

// Hook for sessions with real-time updates
export function useSessions() {
  const result = useRealtimeData(sessionsService);
  
  const startSession = useCallback(async (sessionData: Omit<Session, 'id' | 'createdAt'>) => {
    try {
      const id = await BoardGameFirebaseService.startSession(sessionData);
      return id;
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to start session');
      throw error;
    }
  }, [result]);

  const endSession = useCallback(async (sessionId: string, endTime: string, totalCost: number) => {
    try {
      await BoardGameFirebaseService.endSession(sessionId, endTime, totalCost);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to end session');
      throw error;
    }
  }, [result]);

  const updateSession = useCallback(async (id: string, updates: Partial<Session>) => {
    try {
      await sessionsService.update(id, updates);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to update session');
      throw error;
    }
  }, [result]);

  return {
    ...result,
    sessions: result.data,
    activeSessions: result.data.filter(session => session.status === 'active'),
    completedSessions: result.data.filter(session => session.status === 'completed'),
    startSession,
    endSession,
    updateSession
  };
}

// Hook for active sessions only
export function useActiveSessions() {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = BoardGameFirebaseService.getActiveSessions((sessions) => {
      setActiveSessions(sessions);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { activeSessions, loading, error };
}

// Hook for tables with real-time updates
export function useTables() {
  const result = useRealtimeData(tablesService);

  const updateTable = useCallback(async (id: string, updates: Partial<Table>) => {
    try {
      await tablesService.update(id, updates);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to update table');
      throw error;
    }
  }, [result]);

  const addTable = useCallback(async (tableData: Omit<Table, 'id' | 'createdAt'>) => {
    try {
      const id = await tablesService.create(tableData);
      return id;
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to add table');
      throw error;
    }
  }, [result]);

  return {
    ...result,
    tables: result.data,
    availableTables: result.data.filter(table => table.status === 'available'),
    occupiedTables: result.data.filter(table => table.status === 'occupied'),
    updateTable,
    addTable
  };
}

// Hook for games with real-time updates
export function useGames() {
  const result = useRealtimeData(gamesService);

  const addGame = useCallback(async (gameData: Omit<Game, 'id' | 'createdAt'>) => {
    try {
      const id = await gamesService.create(gameData);
      return id;
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to add game');
      throw error;
    }
  }, [result]);

  const updateGame = useCallback(async (id: string, updates: Partial<Game>) => {
    try {
      await gamesService.update(id, updates);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to update game');
      throw error;
    }
  }, [result]);

  const deleteGame = useCallback(async (id: string) => {
    try {
      await gamesService.delete(id);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to delete game');
      throw error;
    }
  }, [result]);

  return {
    ...result,
    games: result.data,
    availableGames: result.data.filter(game => game.isAvailable),
    addGame,
    updateGame,
    deleteGame
  };
}

// Hook for activity logs with real-time updates
export function useActivityLogs(limit: number = 50) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = BoardGameFirebaseService.getRecentActivityLogs(limit, (newLogs) => {
      setLogs(newLogs);
      setLoading(false);
    });

    return unsubscribe;
  }, [limit]);

  const addLog = useCallback(async (logData: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    try {
      await activityLogsService.create(logData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add activity log');
      throw error;
    }
  }, []);

  return { logs, loading, error, addLog };
}

// Hook for payments with real-time updates
export function usePayments() {
  const result = useRealtimeData(paymentsService);

  const addPayment = useCallback(async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const id = await paymentsService.create(paymentData);
      return id;
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to add payment');
      throw error;
    }
  }, [result]);

  const updatePayment = useCallback(async (id: string, updates: Partial<Payment>) => {
    try {
      await paymentsService.update(id, updates);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to update payment');
      throw error;
    }
  }, [result]);

  return {
    ...result,
    payments: result.data,
    addPayment,
    updatePayment
  };
}

// Hook for promotions with real-time updates
export function usePromotions() {
  const result = useRealtimeData(promotionsService);

  const addPromotion = useCallback(async (promotionData: Omit<Promotion, 'id' | 'createdAt'>) => {
    try {
      const id = await promotionsService.create(promotionData);
      return id;
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to add promotion');
      throw error;
    }
  }, [result]);

  const updatePromotion = useCallback(async (id: string, updates: Partial<Promotion>) => {
    try {
      await promotionsService.update(id, updates);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to update promotion');
      throw error;
    }
  }, [result]);

  const deletePromotion = useCallback(async (id: string) => {
    try {
      await promotionsService.delete(id);
    } catch (error) {
      result.setError(error instanceof Error ? error.message : 'Failed to delete promotion');
      throw error;
    }
  }, [result]);

  return {
    ...result,
    promotions: result.data,
    activePromotions: result.data.filter(promo => promo.isActive),
    addPromotion,
    updatePromotion,
    deletePromotion
  };
}

// Hook for real-time broadcasts
export function useBroadcasts() {
  const [lastBroadcast, setLastBroadcast] = useState<{ eventType: string; data: any } | null>(null);

  useEffect(() => {
    const unsubscribe = listenToBroadcasts((eventType, data) => {
      setLastBroadcast({ eventType, data });
    });

    return unsubscribe;
  }, []);

  const broadcast = useCallback(async (eventType: string, data: any) => {
    try {
      await BoardGameFirebaseService.broadcastUpdate(eventType, data);
    } catch (error) {
      console.error('Failed to broadcast update:', error);
    }
  }, []);

  return { lastBroadcast, broadcast };
}

// Hook for customer sessions
export function useCustomerSessions(customerId: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = BoardGameFirebaseService.getCustomerSessions(customerId, (customerSessions) => {
      setSessions(customerSessions);
      setLoading(false);
    });

    return unsubscribe;
  }, [customerId]);

  return { sessions, loading, error };
}
