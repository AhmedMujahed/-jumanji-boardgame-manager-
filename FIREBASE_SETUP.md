# 🔥 Firebase Real-time Database Setup Guide

This guide will help you set up Firebase Real-time Database for your Board Game Manager application with live replication across all devices.

## 📋 Prerequisites

- Firebase account (free tier is sufficient for most use cases)
- Node.js and npm installed
- Your Board Game Manager project

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "board-game-manager")
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

## 🔧 Step 2: Enable Real-time Database

1. In your Firebase project console, go to "Realtime Database"
2. Click "Create Database"
3. Choose location (select closest to your users)
4. Start in **test mode** for now (we'll secure it later)
5. Click "Done"

## 🌐 Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web app" icon (`</>`)
4. Register your app with a name
5. Copy the configuration object

## ⚙️ Step 4: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Copy the contents from `firebase-env-example.txt`
3. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔒 Step 5: Set Up Security Rules

1. In Firebase Console, go to "Realtime Database"
2. Click on "Rules" tab
3. Replace the default rules with the contents from `firebase-database-rules.json`
4. Click "Publish"

**Important:** The current rules require authentication. For testing, you can temporarily use:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## 🔐 Step 6: Set Up Authentication (Optional but Recommended)

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable your preferred sign-in methods:
   - **Email/Password** (recommended for admin users)
   - **Anonymous** (for guest access)
   - **Google** (for easy social login)

## 📦 Step 7: Install Dependencies

The Firebase SDK is already included in your `package.json`. If you need to install it manually:

```bash
npm install firebase
```

## 🎮 Step 8: Initialize Your Data Structure

The Firebase setup automatically creates the following data structure:

```
your-firebase-database/
├── customers/
├── sessions/
├── games/
├── tables/
├── payments/
├── promotions/
├── reservations/
├── activityLogs/
├── users/
├── broadcasts/
└── analytics/
```

## 🔄 Step 9: Switch to Firebase Dashboard

Replace your current dashboard import with the Firebase-enabled version:

```typescript
// In your main App component or wherever you use Dashboard
import FirebaseDashboard from './components/FirebaseDashboard';

// Use FirebaseDashboard instead of Dashboard
<FirebaseDashboard user={user} onLogout={handleLogout} />
```

## 🧪 Step 10: Test Real-time Functionality

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in multiple browser tabs/windows
3. Add a customer in one tab
4. Watch it appear instantly in other tabs
5. Start a session in one tab
6. See the live updates in all other tabs

## 🌟 Features You Get

### ✅ Real-time Synchronization
- **Instant Updates**: Changes appear immediately across all connected devices
- **Live Session Tracking**: Active sessions update in real-time
- **Customer Management**: Add/edit customers with instant sync
- **Table Status**: Table availability updates live

### ✅ Offline Support
- **Offline Persistence**: Data cached locally when offline
- **Automatic Sync**: Changes sync when connection restored
- **Conflict Resolution**: Firebase handles data conflicts automatically

### ✅ Scalable Architecture
- **Multi-device Support**: Unlimited concurrent users
- **Performance**: Optimized for real-time applications
- **Reliability**: 99.95% uptime SLA from Google

### ✅ Advanced Features
- **Broadcasting**: Send real-time notifications to all users
- **Activity Logging**: Track all user actions with timestamps
- **Analytics Ready**: Built-in support for usage analytics

## 📊 Database Structure

### Customers
```json
{
  "customers": {
    "customer-id": {
      "id": "customer-id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "totalSessions": 5,
      "totalSpent": 150,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Sessions
```json
{
  "sessions": {
    "session-id": {
      "id": "session-id",
      "customerId": "customer-id",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T12:00:00Z",
      "status": "completed",
      "hours": 2,
      "totalCost": 60,
      "tableId": "table-id",
      "tableNumber": 1,
      "gameMasterId": "user-id",
      "capacity": 4,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

### Tables
```json
{
  "tables": {
    "table-id": {
      "id": "table-id",
      "tableNumber": 1,
      "status": "available",
      "capacity": 6,
      "type": "premium",
      "features": ["Large surface", "LED lighting"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 🔧 Customization

### Adding New Data Types

1. **Define Type**: Add to `src/types.ts`
2. **Create Service**: Add to `src/lib/firebase-realtime.ts`
3. **Add Hook**: Create hook in `src/hooks/useFirebaseRealtime.ts`
4. **Update Rules**: Add security rules in `firebase-database-rules.json`

### Real-time Hooks Usage

```typescript
import { useCustomers, useSessions, useActiveSessions } from '../hooks/useFirebaseRealtime';

function MyComponent() {
  const { customers, addCustomer, updateCustomer } = useCustomers();
  const { activeSessions } = useActiveSessions();
  const { broadcast } = useBroadcasts();

  const handleAddCustomer = async (customerData) => {
    const id = await addCustomer(customerData);
    await broadcast('customer:added', { customerId: id });
  };

  return (
    <div>
      <h2>Customers ({customers.length})</h2>
      <h3>Active Sessions ({activeSessions.length})</h3>
    </div>
  );
}
```

### Broadcasting Custom Events

```typescript
import { useBroadcasts } from '../hooks/useFirebaseRealtime';

function AdminPanel() {
  const { broadcast } = useBroadcasts();

  const sendMaintenanceAlert = async () => {
    await broadcast('maintenance:alert', {
      message: 'System maintenance in 10 minutes',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <button onClick={sendMaintenanceAlert}>
      Send Maintenance Alert
    </button>
  );
}
```

## 🚨 Production Security

### Secure Database Rules

Replace test rules with production-ready rules from `firebase-database-rules.json`:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "customers": {
      ".indexOn": ["name", "phone", "email"]
    },
    "sessions": {
      ".indexOn": ["customerId", "status", "startTime"]
    }
  }
}
```

### Authentication Setup

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './lib/firebase';

const signIn = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
```

## 📈 Monitoring & Analytics

### Firebase Console
- **Usage**: Monitor read/write operations
- **Performance**: Track response times
- **Errors**: View error logs and debugging info

### Built-in Analytics
- **User Activity**: Track user actions automatically
- **Session Metrics**: Monitor session duration and frequency
- **Revenue Tracking**: Real-time revenue calculations

## 🔄 Migration from Supabase

If you're migrating from Supabase:

1. **Export Data**: Export your Supabase data to JSON
2. **Import to Firebase**: Use Firebase Admin SDK to import data
3. **Update Components**: Replace Supabase hooks with Firebase hooks
4. **Test Thoroughly**: Verify all functionality works as expected

## 🆘 Troubleshooting

### Common Issues

**Connection Problems**
- Check your API keys in `.env.local`
- Verify database URL format
- Ensure rules allow read/write access

**Data Not Syncing**
- Check browser console for errors
- Verify internet connection
- Check Firebase Console for quota limits

**Performance Issues**
- Add database indexes for frequently queried fields
- Limit data fetching with pagination
- Use Firebase Performance Monitoring

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs/database)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

## 🎉 Next Steps

1. **Test Real-time Features**: Try the app with multiple devices
2. **Set Up Authentication**: Implement secure user login
3. **Add More Features**: Extend with notifications, analytics
4. **Deploy**: Deploy your app with Firebase Hosting
5. **Monitor**: Set up alerts and monitoring

Your Board Game Manager now has enterprise-grade real-time capabilities! 🚀

---

**Happy Gaming with Real-time Updates! 🎲✨**
