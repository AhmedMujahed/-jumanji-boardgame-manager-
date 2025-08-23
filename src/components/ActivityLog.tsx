import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ActivityLog } from '../types';

interface ActivityLogProps {
  logs: ActivityLog[];
  user: any;
  onClearAllLogs: () => void;
}

const ActivityLogComponent: React.FC<ActivityLogProps> = ({ logs, user, onClearAllLogs }) => {
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>(logs);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Additional security check - only owners can access this component
  if (user.role !== 'owner') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-2xl font-arcade font-bold text-gold-bright mb-4">
          Access Denied
        </h3>
        <p className="text-neon-bright text-lg font-arcade">
          You don't have permission to view activity logs.
        </p>
        <p className="text-neon-bright/80 text-md font-arcade mt-2">
          This feature is restricted to owners only.
        </p>
      </div>
    );
  }

  useEffect(() => {
    let filtered = logs;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.type === selectedType);
    }

    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedUser);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedType, selectedUser, searchTerm]);

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'session_start': return '🎮';
      case 'session_end': return '⏹️';
      case 'session_edit': return '✏️';
      case 'session_delete': return '🗑️';
      case 'customer_add': return '👥';
      case 'customer_edit': return '✏️';
      case 'customer_delete': return '🗑️';
      case 'payment_add': return '💰';
      case 'payment_edit': return '✏️';
      case 'payment_delete': return '🗑️';
      case 'game_add': return '🎲';
      case 'game_edit': return '✏️';
      case 'game_delete': return '🗑️';
      case 'table_add': return '🏠';
      case 'table_edit': return '✏️';
      case 'table_delete': return '🗑️';
      case 'reservation_add': return '📅';
      case 'reservation_edit': return '✏️';
      case 'reservation_delete': return '🗑️';
      case 'user_login': return '🔐';
      case 'user_logout': return '🚪';
      case 'system_action': return '⚙️';
      default: return '📝';
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'session_start': return 'text-success-400';
      case 'session_end': return 'text-warning-400';
      case 'session_edit': return 'text-neon-bright';
      case 'session_delete': return 'text-danger-400';
      case 'customer_add': return 'text-success-400';
      case 'customer_edit': return 'text-neon-bright';
      case 'customer_delete': return 'text-danger-400';
      case 'payment_add': return 'text-success-400';
      case 'payment_edit': return 'text-neon-bright';
      case 'payment_delete': return 'text-danger-400';
      case 'game_add': return 'text-success-400';
      case 'game_edit': return 'text-neon-bright';
      case 'game_delete': return 'text-danger-400';
      case 'table_add': return 'text-success-400';
      case 'table_edit': return 'text-neon-bright';
      case 'table_delete': return 'text-danger-400';
      case 'reservation_add': return 'text-success-400';
      case 'reservation_edit': return 'text-neon-bright';
      case 'reservation_delete': return 'text-danger-400';
      case 'user_login': return 'text-success-400';
      case 'user_logout': return 'text-warning-400';
      case 'system_action': return 'text-gold-bright';
      default: return 'text-neon-bright';
    }
  };

  const getUniqueUsers = () => {
    const users = logs.map(log => ({ id: log.userId, name: log.userName, role: log.userRole }));
    return Array.from(new Map(users.map(user => [user.id, user])).values());
  };

  const getUniqueTypes = () => {
    return Array.from(new Set(logs.map(log => log.type)));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">📋</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Activity Log
            </h2>
            <p className="text-neon-bright/80 font-arcade">
              Comprehensive tracking of all system activities
            </p>
          </div>
        </div>
        <div className="text-neon-bright/60 font-arcade text-sm">
          Total Logs: {logs.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
            >
              <option value="all">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>
                  {getLogTypeIcon(type)} {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white font-arcade transition-all duration-300"
            >
              <option value="all">All Users</option>
              {getUniqueUsers().map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search actions, details, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 font-arcade transition-all duration-300"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end space-x-3">
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedUser('all');
                setSearchTerm('');
              }}
              className="flex-1 px-4 py-3 bg-void-700 hover:bg-void-600 text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-void-600 hover:border-neon-bright/50"
            >
              🗑️ Clear Filters
            </button>
            
            {/* Clear All Logs Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
                  onClearAllLogs();
                }
              }}
              className="flex-1 px-4 py-3 bg-danger-600 hover:bg-danger-700 text-white font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-danger-500 hover:border-danger-600"
            >
              🧹 Clear All Logs
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-neon-bright/30">
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Type</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">User</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Action</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Details</th>
                <th className="text-left py-4 px-4 text-gold-bright font-arcade font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr 
                  key={log.id}
                  className="border-b border-neon-bright/20 hover:bg-void-800/50 transition-colors duration-300"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getLogTypeIcon(log.type)}</span>
                      <span className={`font-arcade font-bold text-sm ${getLogTypeColor(log.type)}`}>
                        {log.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-arcade font-bold text-white">
                        {log.userName}
                      </div>
                      <div className="text-neon-bright/70 font-arcade text-xs">
                        {log.userRole}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-arcade font-bold text-neon-bright">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="max-w-xs">
                      <div className="text-neon-bright/80 font-arcade text-sm">
                        {log.details}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-neon-bright/70 font-arcade text-sm">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
              No logs found
            </h3>
            <p className="text-neon-bright/70 font-arcade text-lg">
              {searchTerm || selectedType !== 'all' || selectedUser !== 'all'
                ? 'Try adjusting your filters'
                : 'No activity has been logged yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogComponent;
