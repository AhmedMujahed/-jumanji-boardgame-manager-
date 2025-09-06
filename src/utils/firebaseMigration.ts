import { 
  customersService, 
  sessionsService, 
  gamesService, 
  tablesService, 
  paymentsService, 
  promotionsService,
  activityLogsService 
} from '../lib/firebase-realtime';
import { 
  Customer, 
  Session, 
  Game, 
  Table, 
  Payment, 
  Promotion, 
  ActivityLog 
} from '../types';

interface MigrationData {
  customers?: Customer[];
  sessions?: Session[];
  games?: Game[];
  tables?: Table[];
  payments?: Payment[];
  promotions?: Promotion[];
  activityLogs?: ActivityLog[];
}

interface MigrationResult {
  success: boolean;
  imported: {
    customers: number;
    sessions: number;
    games: number;
    tables: number;
    payments: number;
    promotions: number;
    activityLogs: number;
  };
  errors: string[];
}

/**
 * Migrate data from localStorage to Firebase
 */
export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    imported: {
      customers: 0,
      sessions: 0,
      games: 0,
      tables: 0,
      payments: 0,
      promotions: 0,
      activityLogs: 0
    },
    errors: []
  };

  try {
    // Get data from localStorage
    const localData = getLocalStorageData();
    
    // Migrate each data type
    await migrateCustomers(localData.customers || [], result);
    await migrateSessions(localData.sessions || [], result);
    await migrateGames(localData.games || [], result);
    await migrateTables(localData.tables || [], result);
    await migratePayments(localData.payments || [], result);
    await migratePromotions(localData.promotions || [], result);
    await migrateActivityLogs(localData.activityLogs || [], result);

    console.log('Migration completed:', result);
    return result;

  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Import data from JSON to Firebase
 */
export async function importDataToFirebase(data: MigrationData): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    imported: {
      customers: 0,
      sessions: 0,
      games: 0,
      tables: 0,
      payments: 0,
      promotions: 0,
      activityLogs: 0
    },
    errors: []
  };

  try {
    // Import each data type
    if (data.customers) await migrateCustomers(data.customers, result);
    if (data.sessions) await migrateSessions(data.sessions, result);
    if (data.games) await migrateGames(data.games, result);
    if (data.tables) await migrateTables(data.tables, result);
    if (data.payments) await migratePayments(data.payments, result);
    if (data.promotions) await migratePromotions(data.promotions, result);
    if (data.activityLogs) await migrateActivityLogs(data.activityLogs, result);

    console.log('Import completed:', result);
    return result;

  } catch (error) {
    result.success = false;
    result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Export current Firebase data to JSON
 */
export async function exportFirebaseData(): Promise<MigrationData> {
  return new Promise((resolve) => {
    const data: MigrationData = {};
    let completedServices = 0;
    const totalServices = 7;

    const checkComplete = () => {
      completedServices++;
      if (completedServices === totalServices) {
        resolve(data);
      }
    };

    // Export customers
    const unsubCustomers = customersService.getAll((customers) => {
      data.customers = customers;
      unsubCustomers();
      checkComplete();
    });

    // Export sessions
    const unsubSessions = sessionsService.getAll((sessions) => {
      data.sessions = sessions;
      unsubSessions();
      checkComplete();
    });

    // Export games
    const unsubGames = gamesService.getAll((games) => {
      data.games = games;
      unsubGames();
      checkComplete();
    });

    // Export tables
    const unsubTables = tablesService.getAll((tables) => {
      data.tables = tables;
      unsubTables();
      checkComplete();
    });

    // Export payments
    const unsubPayments = paymentsService.getAll((payments) => {
      data.payments = payments;
      unsubPayments();
      checkComplete();
    });

    // Export promotions
    const unsubPromotions = promotionsService.getAll((promotions) => {
      data.promotions = promotions;
      unsubPromotions();
      checkComplete();
    });

    // Export activity logs
    const unsubLogs = activityLogsService.getAll((logs) => {
      data.activityLogs = logs;
      unsubLogs();
      checkComplete();
    });
  });
}

/**
 * Create sample data for testing
 */
export function createSampleData(): MigrationData {
  const now = new Date().toISOString();
  
  const sampleCustomers: Customer[] = [
    {
      id: 'customer-1',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      notes: 'Regular customer, loves strategy games',
      totalSessions: 15,
      totalSpent: 450,
      lastVisit: now,
      createdAt: now
    },
    {
      id: 'customer-2',
      name: 'Fatima Hassan',
      email: 'fatima@example.com',
      phone: '+966509876543',
      notes: 'Prefers cooperative games',
      totalSessions: 8,
      totalSpent: 240,
      lastVisit: now,
      createdAt: now
    }
  ];

  const sampleGames: Game[] = [
    {
      id: 'game-1',
      name: 'Settlers of Catan',
      description: 'A classic strategy board game about building and trading',
      category: 'Strategy',
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
      difficulty: 'intermediate',
      isAvailable: true,
      location: 'Shelf A-1',
      features: ['Trading', 'Building', 'Dice Rolling'],
      ageRecommendation: '10+',
      tags: ['strategy', 'trading', 'building'],
      copiesAvailable: 2,
      forSale: true,
      price: 150,
      copiesForSale: 1,
      createdAt: now
    },
    {
      id: 'game-2',
      name: 'Pandemic',
      description: 'Cooperative game where players work together to save the world',
      category: 'Cooperative',
      minPlayers: 2,
      maxPlayers: 4,
      duration: 60,
      difficulty: 'intermediate',
      isAvailable: true,
      location: 'Shelf A-2',
      features: ['Cooperative', 'Strategy', 'Thematic'],
      ageRecommendation: '8+',
      tags: ['coop', 'strategy', 'medical'],
      copiesAvailable: 1,
      forSale: false,
      createdAt: now
    }
  ];

  const sampleTables: Table[] = [
    {
      id: 'table-1',
      tableNumber: 1,
      status: 'available',
      capacity: 6,
      currentSessionId: undefined,
      customerName: undefined,
      startTime: undefined,
      type: 'premium',
      features: ['Large surface', 'LED lighting', 'Cup holders'],
      location: 'Main hall - North',
      notes: 'Premium table with extra space',
      createdAt: now,
      lastUpdated: now
    },
    {
      id: 'table-2',
      tableNumber: 2,
      status: 'available',
      capacity: 4,
      currentSessionId: undefined,
      customerName: undefined,
      startTime: undefined,
      type: 'standard',
      features: ['Standard surface', 'Comfortable seating'],
      location: 'Main hall - South',
      notes: 'Good for small groups',
      createdAt: now,
      lastUpdated: now
    }
  ];

  const samplePromotions: Promotion[] = [
    {
      id: 'promo-1',
      name: 'Weekend Special',
      firstHourPrice: 25,
      extraHourPrice: 20,
      isActive: true,
      startDate: now,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now
    }
  ];

  return {
    customers: sampleCustomers,
    games: sampleGames,
    tables: sampleTables,
    promotions: samplePromotions,
    sessions: [],
    payments: [],
    activityLogs: []
  };
}

// Helper functions
function getLocalStorageData(): MigrationData {
  try {
    return {
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      sessions: JSON.parse(localStorage.getItem('sessions') || '[]'),
      games: JSON.parse(localStorage.getItem('games') || '[]'),
      tables: JSON.parse(localStorage.getItem('tables') || '[]'),
      payments: JSON.parse(localStorage.getItem('payments') || '[]'),
      promotions: JSON.parse(localStorage.getItem('promotions') || '[]'),
      activityLogs: JSON.parse(localStorage.getItem('activityLogs') || '[]')
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return {};
  }
}

async function migrateCustomers(customers: Customer[], result: MigrationResult): Promise<void> {
  for (const customer of customers) {
    try {
      // Remove the id field and let Firebase generate a new one
      const { id, ...customerData } = customer;
      await customersService.create(customerData as Omit<Customer, 'id'>);
      result.imported.customers++;
    } catch (error) {
      result.errors.push(`Failed to migrate customer ${customer.name}: ${error}`);
    }
  }
}

async function migrateSessions(sessions: Session[], result: MigrationResult): Promise<void> {
  for (const session of sessions) {
    try {
      const { id, ...sessionData } = session;
      await sessionsService.create(sessionData as Omit<Session, 'id'>);
      result.imported.sessions++;
    } catch (error) {
      result.errors.push(`Failed to migrate session ${session.id}: ${error}`);
    }
  }
}

async function migrateGames(games: Game[], result: MigrationResult): Promise<void> {
  for (const game of games) {
    try {
      const { id, ...gameData } = game;
      await gamesService.create(gameData as Omit<Game, 'id'>);
      result.imported.games++;
    } catch (error) {
      result.errors.push(`Failed to migrate game ${game.name}: ${error}`);
    }
  }
}

async function migrateTables(tables: Table[], result: MigrationResult): Promise<void> {
  for (const table of tables) {
    try {
      const { id, ...tableData } = table;
      await tablesService.create(tableData as Omit<Table, 'id'>);
      result.imported.tables++;
    } catch (error) {
      result.errors.push(`Failed to migrate table ${table.tableNumber}: ${error}`);
    }
  }
}

async function migratePayments(payments: Payment[], result: MigrationResult): Promise<void> {
  for (const payment of payments) {
    try {
      const { id, ...paymentData } = payment;
      await paymentsService.create(paymentData as Omit<Payment, 'id'>);
      result.imported.payments++;
    } catch (error) {
      result.errors.push(`Failed to migrate payment ${payment.id}: ${error}`);
    }
  }
}

async function migratePromotions(promotions: Promotion[], result: MigrationResult): Promise<void> {
  for (const promotion of promotions) {
    try {
      const { id, ...promotionData } = promotion;
      await promotionsService.create(promotionData as Omit<Promotion, 'id'>);
      result.imported.promotions++;
    } catch (error) {
      result.errors.push(`Failed to migrate promotion ${promotion.name}: ${error}`);
    }
  }
}

async function migrateActivityLogs(logs: ActivityLog[], result: MigrationResult): Promise<void> {
  for (const log of logs) {
    try {
      const { id, ...logData } = log;
      await activityLogsService.create(logData as Omit<ActivityLog, 'id'>);
      result.imported.activityLogs++;
    } catch (error) {
      result.errors.push(`Failed to migrate activity log ${log.id}: ${error}`);
    }
  }
}
