import React, { useState } from 'react';
import { Game } from '../types';

interface GameLibraryProps {
  games: Game[];
  onAddGame: (game: Omit<Game, 'id'>) => void;
  onUpdateGame: (gameId: string, updates: Partial<Game>) => void;
  onDeleteGame: (gameId: string) => void;
}

const GameLibrary: React.FC<GameLibraryProps> = ({ games, onAddGame, onUpdateGame, onDeleteGame }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    minPlayers: 1,
    maxPlayers: 4,
    duration: 60,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    isAvailable: true
  });

  const categories = ['Strategy', 'Party', 'Adventure', 'Puzzle', 'Card', 'Dice', 'RPG', 'Other'];
  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'success', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning', icon: '🔥' },
    { value: 'advanced', label: 'Advanced', color: 'danger', icon: '⚡' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGame({
      ...formData,
      features: [],
      createdAt: new Date().toISOString()
    });
    setFormData({
      name: '',
      description: '',
      category: '',
      minPlayers: 1,
      maxPlayers: 4,
      duration: 60,
      difficulty: 'beginner',
      isAvailable: true
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'success';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🔥';
      case 'advanced': return '⚡';
      default: return '🌱';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">🎲</span>
          <div>
            <h2 className="text-3xl font-arcade font-black text-gold-bright">
              Game Library
            </h2>
            <p className="text-void-800 dark:text-neon-bright/80 font-arcade">
              Manage your board game collection
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>ADD GAME</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright/50 dark:border-neon-bright p-6 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
              Search Games
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 font-arcade transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Add Game Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-void-1000/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-light-100 dark:bg-void-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-neon-bright p-8 w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎲</span>
                <h3 className="text-2xl font-arcade font-black text-gold-bright">
                  Add New Game
                </h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 bg-light-200 dark:bg-void-800 hover:bg-light-300 dark:hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Game Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter game name"
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Min Players
                  </label>
                  <input
                    type="number"
                    name="minPlayers"
                    value={formData.minPlayers}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Max Players
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="5"
                    max="480"
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>
                        {diff.icon} {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the game..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-neon-bright border-2 border-neon-bright rounded focus:ring-neon-glow"
                />
                <label className="text-void-800 dark:text-neon-bright font-arcade font-bold">
                  Game is available for play
                </label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-light-300 dark:bg-void-700 hover:bg-light-400 dark:hover:bg-void-600 text-void-800 dark:text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-light-400 dark:border-void-600 hover:border-neon-bright/50"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright"
                >
                  ADD GAME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map(game => (
          <div 
            key={game.id} 
            className={`bg-light-100 dark:bg-void-900/90 backdrop-blur-md rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              game.isAvailable 
                ? 'border-success-500/50 dark:border-success-500' 
                : 'border-danger-500/50 dark:border-danger-500'
            }`}
          >
            <div className="p-6">
              {/* Game Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-arcade font-bold text-void-900 dark:text-white text-lg mb-2">
                    {game.name}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-arcade font-bold ${
                      getDifficultyColor(game.difficulty) === 'success' ? 'bg-success-500/20 text-success-400 border border-success-500' :
                      getDifficultyColor(game.difficulty) === 'warning' ? 'bg-warning-500/20 text-warning-400 border border-warning-500' :
                      'bg-danger-500/20 text-danger-400 border border-danger-500'
                    }`}>
                      {getDifficultyIcon(game.difficulty)} {game.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-neon-bright/20 text-neon-bright border border-neon-bright rounded-full text-xs font-arcade font-bold">
                      {game.category}
                    </span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  game.isAvailable ? 'bg-success-500' : 'bg-danger-500'
                }`} title={game.isAvailable ? 'Available' : 'Unavailable'} />
              </div>

              {/* Game Description */}
              <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-sm mb-4 line-clamp-2">
                {game.description || 'No description available'}
              </p>

              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-void-800 dark:text-neon-bright font-arcade font-bold text-sm">
                    👥 Players
                  </p>
                  <p className="text-void-900 dark:text-white font-arcade font-black">
                    {game.minPlayers}-{game.maxPlayers}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-void-800 dark:text-neon-bright font-arcade font-bold text-sm">
                    ⏱️ Duration
                  </p>
                  <p className="text-void-900 dark:text-white font-arcade font-black">
                    {game.duration}m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-void-800 dark:text-neon-bright font-arcade font-bold text-sm">
                    📍 Location
                  </p>
                  <p className="text-void-900 dark:text-white font-arcade font-black">
                    {game.location || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => onUpdateGame(game.id, { isAvailable: !game.isAvailable })}
                  className={`flex-1 px-3 py-2 rounded-lg font-arcade font-bold text-sm transition-all duration-300 ${
                    game.isAvailable
                      ? 'bg-danger-600 hover:bg-danger-700 text-white'
                      : 'bg-success-600 hover:bg-success-700 text-white'
                  }`}
                >
                  {game.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button 
                  onClick={() => onDeleteGame(game.id)}
                  className="px-3 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-all duration-300"
                  title="Delete game"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGames.length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🎲</div>
          <h3 className="text-2xl font-arcade font-black text-gold-bright mb-4">
            {searchTerm || selectedCategory !== 'all' ? 'No games found' : 'No games yet'}
          </h3>
          <p className="text-void-700 dark:text-neon-bright/70 font-arcade text-lg mb-8">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add your first board game to start building your collection!'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon hover:shadow-neon-lg border-2 border-neon-bright flex items-center space-x-3 mx-auto"
            >
              <span className="text-2xl">🎮</span>
              <span>ADD FIRST GAME</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameLibrary;
