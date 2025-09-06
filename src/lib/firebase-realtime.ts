import { 
  ref, 
  push, 
  set, 
  update, 
  remove, 
  onValue, 
  off, 
  serverTimestamp,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database';
import { database } from './firebase';
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

// Database paths
export const DB_PATHS = {
  customers: 'customers',
  sessions: 'sessions',
  activityLogs: 'activityLogs',
  payments: 'payments',
  games: 'games',
  tables: 'tables',
  reservations: 'reservations',
  promotions: 'promotions',
  users: 'users',
  analytics: 'analytics'
} as const;

// Generic CRUD operations
export class FirebaseRealtimeService<T extends { id: string }> {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  // Create a new record
  async create(data: Omit<T, 'id'>): Promise<string> {
    const newRef = push(ref(database, this.path));
    const id = newRef.key!;
    const recordWithId = { ...data, id, createdAt: serverTimestamp() };
    await set(newRef, recordWithId);
    return id;
  }

  // Update an existing record
  async update(id: string, data: Partial<T>): Promise<void> {
    const recordRef = ref(database, `${this.path}/${id}`);
    const updateData = { ...data, lastUpdated: serverTimestamp() };
    await update(recordRef, updateData);
  }

  // Delete a record
  async delete(id: string): Promise<void> {
    const recordRef = ref(database, `${this.path}/${id}`);
    await remove(recordRef);
  }

  // Get a single record
  getOne(id: string, callback: (data: T | null) => void): () => void {
    const recordRef = ref(database, `${this.path}/${id}`);
    const unsubscribe = onValue(recordRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data ? { ...data, id: snapshot.key } : null);
    });
    return () => off(recordRef, 'value', unsubscribe);
  }

  // Get all records with real-time updates
  getAll(callback: (data: T[]) => void): () => void {
    const collectionRef = ref(database, this.path);
    const unsubscribe = onValue(collectionRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const records: T[] = data 
        ? Object.keys(data).map(key => ({ ...data[key], id: key }))
        : [];
      callback(records);
    });
    return () => off(collectionRef, 'value', unsubscribe);
  }

  // Query records with a filter
  getFiltered(
    filterFn: (item: T) => boolean, 
    callback: (data: T[]) => void
  ): () => void {
    return this.getAll((allData) => {
      const filtered = allData.filter(filterFn);
      callback(filtered);
    });
  }
}

// Specialized services for each entity type
export const customersService = new FirebaseRealtimeService<Customer>(DB_PATHS.customers);
export const sessionsService = new FirebaseRealtimeService<Session>(DB_PATHS.sessions);
export const activityLogsService = new FirebaseRealtimeService<ActivityLog>(DB_PATHS.activityLogs);
export const paymentsService = new FirebaseRealtimeService<Payment>(DB_PATHS.payments);
export const gamesService = new FirebaseRealtimeService<Game>(DB_PATHS.games);
export const tablesService = new FirebaseRealtimeService<Table>(DB_PATHS.tables);
export const reservationsService = new FirebaseRealtimeService<Reservation>(DB_PATHS.reservations);
export const promotionsService = new FirebaseRealtimeService<Promotion>(DB_PATHS.promotions);

// Advanced queries and business logic
export class BoardGameFirebaseService {
  // Get active sessions with real-time updates
  static getActiveSessions(callback: (sessions: Session[]) => void): () => void {
    return sessionsService.getFiltered(
      (session) => session.status === 'active',
      callback
    );
  }

  // Get sessions for a specific customer
  static getCustomerSessions(
    customerId: string, 
    callback: (sessions: Session[]) => void
  ): () => void {
    return sessionsService.getFiltered(
      (session) => session.customerId === customerId,
      callback
    );
  }

  // Get available tables
  static getAvailableTables(callback: (tables: Table[]) => void): () => void {
    return tablesService.getFiltered(
      (table) => table.status === 'available',
      callback
    );
  }

  // Get occupied tables with session info
  static getOccupiedTables(callback: (tables: Table[]) => void): () => void {
    return tablesService.getFiltered(
      (table) => table.status === 'occupied',
      callback
    );
  }

  // Get recent activity logs
  static getRecentActivityLogs(
    limit: number,
    callback: (logs: ActivityLog[]) => void
  ): () => void {
    return activityLogsService.getAll((allLogs) => {
      const sorted = allLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      callback(sorted);
    });
  }

  // Start a new session
  static async startSession(sessionData: Omit<Session, 'id' | 'createdAt'>): Promise<string> {
    const sessionId = await sessionsService.create(sessionData);
    
    // Update table status
    if (sessionData.tableId) {
      await tablesService.update(sessionData.tableId, {
        status: 'occupied',
        currentSessionId: sessionId,
        startTime: sessionData.startTime
      } as Partial<Table>);
    }

    // Log the activity
    await activityLogsService.create({
      type: 'session_start',
      userId: sessionData.gameMasterId,
      userName: 'Game Master', // You might want to get this from user data
      userRole: 'game_master',
      action: 'Started new session',
      details: `Started session for customer ${sessionData.customerId} at table ${sessionData.tableNumber}`,
      timestamp: new Date().toISOString()
    } as Omit<ActivityLog, 'id' | 'createdAt'>);

    return sessionId;
  }

  // End a session
  static async endSession(sessionId: string, endTime: string, totalCost: number): Promise<void> {
    const session = await new Promise<Session | null>((resolve) => {
      const unsubscribe = sessionsService.getOne(sessionId, (data) => {
        unsubscribe();
        resolve(data);
      });
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Update session
    await sessionsService.update(sessionId, {
      endTime,
      totalCost,
      status: 'completed'
    } as Partial<Session>);

    // Update table status
    if (session.tableId) {
      await tablesService.update(session.tableId, {
        status: 'available',
        currentSessionId: undefined,
        startTime: undefined
      } as Partial<Table>);
    }

    // Update customer stats
    await this.updateCustomerStats(session.customerId, totalCost, session.hours);

    // Log the activity
    await activityLogsService.create({
      type: 'session_end',
      userId: session.gameMasterId,
      userName: 'Game Master',
      userRole: 'game_master',
      action: 'Ended session',
      details: `Ended session for customer ${session.customerId}, duration: ${session.hours} hours, cost: ${totalCost} SAR`,
      timestamp: new Date().toISOString()
    } as Omit<ActivityLog, 'id' | 'createdAt'>);
  }

  // Update customer statistics
  static async updateCustomerStats(customerId: string, additionalSpent: number, additionalHours: number): Promise<void> {
    const customer = await new Promise<Customer | null>((resolve) => {
      const unsubscribe = customersService.getOne(customerId, (data) => {
        unsubscribe();
        resolve(data);
      });
    });

    if (customer) {
      await customersService.update(customerId, {
        totalSessions: customer.totalSessions + 1,
        totalSpent: customer.totalSpent + additionalSpent,
        lastVisit: new Date().toISOString()
      } as Partial<Customer>);
    }
  }

  // Broadcast real-time updates to all connected clients
  static async broadcastUpdate(eventType: string, data: any): Promise<void> {
    const broadcastRef = ref(database, `broadcasts/${Date.now()}`);
    await set(broadcastRef, {
      eventType,
      data,
      timestamp: serverTimestamp()
    });
  }
}

// Real-time event listeners for broadcast updates
export function listenToBroadcasts(callback: (eventType: string, data: any) => void): () => void {
  const broadcastRef = ref(database, 'broadcasts');
  const unsubscribe = onValue(broadcastRef, (snapshot: DataSnapshot) => {
    const broadcasts = snapshot.val();
    if (broadcasts) {
      // Get the latest broadcast
      const latestKey = Object.keys(broadcasts).sort().pop();
      if (latestKey) {
        const latest = broadcasts[latestKey];
        callback(latest.eventType, latest.data);
      }
    }
  });
  return () => off(broadcastRef, 'value', unsubscribe);
}

export default BoardGameFirebaseService;
