import React, { useState } from 'react';
import JumanjiCard from './JumanjiCard';
import JumanjiButton from './JumanjiButton';
import { User } from '../types';

interface LoginProps {
  onLogin: (userData: User) => void;
}

// Predefined user accounts
const PREDEFINED_ACCOUNTS = {
  'jumanji_owner': {
    id: 'owner-001',
    username: 'jumanji_owner',
    password: 'OwN3r!2024#JMN',
    role: 'owner' as const,
    displayName: 'Shop Owner'
  },
  'game_master': {
    id: 'gm-001', 
    username: 'game_master',
    password: 'GM@2024!Jmn#',
    role: 'game_master' as const,
    displayName: 'Game Master'
  }
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Normalize inputs to avoid whitespace/case issues
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const account = PREDEFINED_ACCOUNTS[normalizedUsername as keyof typeof PREDEFINED_ACCOUNTS];

    if (!account || account.password !== normalizedPassword) {
      setError('Invalid username or password');
      return;
    }

    // Successful login
    onLogin({
      id: account.id,
      username: account.username,
      role: account.role,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-void-1000 bg-jumanji-pattern bg-dice-pattern flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-neon-bright/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gold-bright/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-neon-glow/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gold-bright via-gold-neon to-gold-500 rounded-full flex items-center justify-center shadow-gold-lg mx-auto mb-6 animate-pulse-slow">
            <span className="text-5xl">🎲</span>
          </div>
          <h1 className="text-6xl font-jumanji font-black text-gold-bright mb-2 animate-glow">
            JUMANJI
          </h1>
          <p className="text-neon-bright text-xl font-arcade font-bold">
            Board Game Shop Management
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-arcade font-bold text-gold-bright mb-3">
              Welcome Back
            </h2>
            <p className="text-neon-bright/80 text-lg font-arcade">
              Sign in to manage your board game shop
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger-500/20 border-2 border-danger-400 rounded-xl">
              <p className="text-danger-400 font-arcade text-center text-sm">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-arcade font-bold text-gold-bright mb-3">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-4 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade text-lg"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-arcade font-bold text-gold-bright mb-3">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-4 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-void-800 text-white placeholder-neon-bright/60 transition-all duration-300 font-arcade text-lg"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center justify-center space-x-3 text-xl"
            >
              <span className="text-2xl">🚀</span>
              <span>SIGN IN</span>
            </button>
          </form>
          
          
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-neon-bright/70 text-lg font-arcade">
            Enter the world of Jumanji and manage your gaming empire
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
