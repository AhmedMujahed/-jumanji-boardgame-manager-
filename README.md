# 🎲 Board Game Manager

A modern web application for managing board game sessions, customers, and hourly billing at 30 SAR per hour.

## ✨ Features

### 🔐 User Management
- **Game Master Role**: Manage sessions and customers
- **Owner Role**: Full access to all features
- Secure login system with role-based access

### 👥 Customer Management
- Add new customers with contact information
- Store customer details (name, phone, email, notes)
- View customer history and session statistics

### ⏱️ Session Management
- Start new gaming sessions for customers
- Live timer tracking for active sessions
- Real-time cost calculation (30 SAR per hour)
- Session notes and game type tracking
- End sessions with automatic billing

### 📊 Dashboard & Analytics
- Overview of business metrics
- Active session monitoring
- Revenue tracking and statistics
- Customer ranking by spending
- Recent session history

### 💰 Billing System
- **Rate**: 30 SAR per 30 minutes per customer
- Automatic 30-minute interval calculation
- Live cost updates during active sessions
- Session completion with final billing

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
   ```bash
   # If you have git installed
   git clone <repository-url>
   cd boardgame-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

### 1. Login
- Enter your username
- Select your role (Game Master or Owner)
- Click "Sign In"

### 2. Add Customers
- Go to the "Customers" tab
- Click "+ Add Customer"
- Fill in customer details (name is required)
- Save the customer

### 3. Start a Session
- Go to the "Sessions" tab
- Click "+ Start New Session"
- Select a customer
- Optionally add game type and notes
- Start the session

### 4. Monitor Active Sessions
- View live timers for all active sessions
- See real-time cost calculations
- Monitor elapsed time and current billing

### 5. End Sessions
- Click "End Session" when the game is complete
- System automatically calculates final cost
- Session moves to completed status

## 💡 Business Rules

- **Rate**: 30 SAR per 30 minutes per customer
- **Billing**: Rounded up to the nearest 30-minute interval
- **Sessions**: Can only be started for existing customers
- **Timing**: Automatic timer starts when session begins
- **Cost Calculation**: Real-time updates during active sessions

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **date-fns** - Date manipulation utilities
- **Local Storage** - Data persistence
- **CSS Grid & Flexbox** - Responsive design

### Architecture
- Component-based architecture
- State management with React hooks
- Local storage for data persistence
- Responsive design for all devices
- Real-time updates and live timers

### Data Structure
```javascript
// Customer
{
  id: string,
  name: string,
  phone: string,
  email: string,
  notes: string,
  createdAt: string
}

// Session
{
  id: string,
  customerId: string,
  gameType: string,
  notes: string,
  startTime: string,
  endTime: string,
  status: 'active' | 'completed',
  hours: number,
  totalCost: number
}
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern web browsers

## 🔒 Data Security

- All data is stored locally in the browser
- No external servers or databases required
- Data persists between browser sessions
- Export/import functionality for data backup

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your repository for automatic deployment
- **GitHub Pages**: Deploy the `build` folder to GitHub Pages
- **Any Static Hosting**: Upload the `build` folder contents

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure all dependencies are properly installed
3. Verify Node.js version compatibility
4. Clear browser cache and local storage if needed

## 🔮 Future Enhancements

- Multiple game tables/rooms
- Customer loyalty programs
- Advanced reporting and analytics
- Export to PDF/Excel
- Multi-language support
- Cloud synchronization
- Payment processing integration

---

**Happy Gaming! 🎲✨**
