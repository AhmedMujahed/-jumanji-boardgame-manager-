import React, { useState } from 'react';
import ModalPortal from './ModalPortal';
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
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    minPlayers: 1,
    maxPlayers: 4,
    duration: 60,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    isAvailable: true,
    ageRecommendation: '',
    tags: '',
    copiesAvailable: 1,
    forSale: false,
    price: 0,
    copiesForSale: 0
  });
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: '',
    minPlayers: 1,
    maxPlayers: 4,
    duration: 60,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    isAvailable: true,
    ageRecommendation: '',
    tags: '',
    copiesAvailable: 1,
    forSale: false,
    price: 0,
    copiesForSale: 0
  });

  const categories = ['Strategy', 'Party', 'Adventure', 'Puzzle', 'Card', 'Dice', 'RPG', 'Other'];
  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'success', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning', icon: '🔥' },
    { value: 'advanced', label: 'Advanced', color: 'danger', icon: '⚡' }
  ];

  const ageOptions = ['4+','6+','8+','10+','12+','14+','16+','18+'];
  const tagOptions = ['co-op','dice','cards','trivia','strategy','party','puzzle','adventure','rpg','family','solo','team','timed'];

  const parseTags = (tagsString: string) => tagsString
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const toggleTag = (tag: string) => {
    const current = new Set(parseTags(formData.tags));
    if (current.has(tag)) current.delete(tag); else current.add(tag);
    setFormData(prev => ({ ...prev, tags: Array.from(current).join(', ') }));
  };

  const toggleEditTag = (tag: string) => {
    const current = new Set(parseTags(editFormData.tags));
    if (current.has(tag)) current.delete(tag); else current.add(tag);
    setEditFormData(prev => ({ ...prev, tags: Array.from(current).join(', ') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Required field validations
    if (!formData.name.trim()) {
      alert('Game name is required');
      return;
    }
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!formData.ageRecommendation.trim()) {
      alert('Age recommendation is required');
      return;
    }
    if (tagsArray.length === 0) {
      alert('Please add at least one tag');
      return;
    }
    if (isNaN(Number(formData.copiesAvailable))) {
      alert('Copies in shop is required');
      return;
    }
    if (formData.forSale) {
      if (!(Number(formData.price) > 0)) {
        alert('Price is required and must be greater than 0');
        return;
      }
      if (!(Number(formData.copiesForSale) >= 1)) {
        alert('Copies for sale is required and must be at least 1');
        return;
      }
    }
    onAddGame({
      ...formData,
      tags: tagsArray,
      copiesAvailable: Number(formData.copiesAvailable) || 0,
      forSale: formData.forSale,
      price: formData.forSale ? Number(formData.price) || 0 : undefined,
      copiesForSale: formData.forSale ? Number(formData.copiesForSale) || 0 : 0,
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
      isAvailable: true,
      ageRecommendation: '',
      tags: '',
      copiesAvailable: 1,
      forSale: false,
      price: 0,
      copiesForSale: 0
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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const openEdit = (game: Game) => {
    setEditingGameId(game.id);
    setEditFormData({
      name: game.name,
      description: game.description,
      category: game.category,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      duration: game.duration,
      difficulty: game.difficulty,
      isAvailable: game.isAvailable,
      ageRecommendation: game.ageRecommendation || '',
      tags: (game.tags || []).join(', '),
      copiesAvailable: game.copiesAvailable ?? 0,
      forSale: game.forSale ?? false,
      price: game.price ?? 0,
      copiesForSale: game.copiesForSale ?? 0
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGameId) return;
    const tagsArray = editFormData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Required field validations for edit
    if (!editFormData.name.trim()) {
      alert('Game name is required');
      return;
    }
    if (!editFormData.category) {
      alert('Category is required');
      return;
    }
    if (!editFormData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!editFormData.ageRecommendation.trim()) {
      alert('Age recommendation is required');
      return;
    }
    if (tagsArray.length === 0) {
      alert('Please add at least one tag');
      return;
    }
    if (isNaN(Number(editFormData.copiesAvailable))) {
      alert('Copies in shop is required');
      return;
    }
    if (editFormData.forSale) {
      if (!(Number(editFormData.price) > 0)) {
        alert('Price is required and must be greater than 0');
        return;
      }
      if (!(Number(editFormData.copiesForSale) >= 1)) {
        alert('Copies for sale is required and must be at least 1');
        return;
      }
    }
    onUpdateGame(editingGameId, {
      name: editFormData.name,
      description: editFormData.description,
      category: editFormData.category,
      minPlayers: editFormData.minPlayers,
      maxPlayers: editFormData.maxPlayers,
      duration: editFormData.duration,
      difficulty: editFormData.difficulty,
      isAvailable: editFormData.isAvailable,
      ageRecommendation: editFormData.ageRecommendation || undefined,
      tags: tagsArray,
      copiesAvailable: Number(editFormData.copiesAvailable) || 0,
      forSale: editFormData.forSale,
      price: editFormData.forSale ? Number(editFormData.price) || 0 : undefined,
      copiesForSale: editFormData.forSale ? Number(editFormData.copiesForSale) || 0 : 0
    });
    setEditingGameId(null);
  };

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    let matchesSearch = true;
    if (searchTerm.startsWith('#tag:')) {
      const tag = searchTerm.replace('#tag:', '').trim();
      matchesSearch = tag === '' || (game.tags || []).some(t => t.toLowerCase() === tag.toLowerCase());
    } else if (searchTerm.startsWith('#age:')) {
      const age = searchTerm.replace('#age:', '').trim();
      matchesSearch = age === '' || (game.ageRecommendation || '').toLowerCase() === age.toLowerCase();
    } else {
      matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    // Group size filter: show games that can accommodate the size between min and max
    let matchesGroup = true;
    const group = Number(selectedGroupSize);
    if (!Number.isNaN(group) && selectedGroupSize !== '') {
      matchesGroup = group >= (game.minPlayers || 1) && group <= (game.maxPlayers || 999);
    }

    return matchesCategory && matchesSearch && matchesGroup;
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300">
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Tag</label>
            <select onChange={(e) => setSearchTerm(`#tag:${e.target.value}`)} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300">
              <option value="">All Tags</option>
              {tagOptions.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Age Filter */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Age</label>
            <select onChange={(e) => setSearchTerm(`#age:${e.target.value}`)} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300">
              <option value="">All Ages</option>
              {ageOptions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Group Size Filter (1-15) */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Group Size</label>
            <select value={selectedGroupSize} onChange={(e) => setSelectedGroupSize(e.target.value)} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300">
              <option value="">Any</option>
              {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                <option key={n} value={String(n)}>{n}</option>
              ))}
            </select>
          </div>

          {/* Free-text Search */}
          <div>
            <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Search</label>
            <input type="text" placeholder="Search by name or description..." value={searchTerm.startsWith('#') ? '' : searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 font-arcade transition-all duration-300" />
          </div>
        </div>
        <div className="mt-2 text-neon-bright/60 text-xs font-arcade">Tip: Use tag/age/group filters to find games fast.</div>
      </div>

      {/* Add Game Modal */}
      {showAddForm && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
            <div className="bg-[#0D0D1A] p-6 rounded-2xl shadow-lg w-full max-w-2xl mx-4 animate-fade-in max-h-[90vh] overflow-y-auto border-2 border-neon-bright">
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
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
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
                    Min Players *
                  </label>
                  <input
                    type="number"
                    name="minPlayers"
                    value={formData.minPlayers}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Max Players *
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="5"
                    max="480"
                    required
                    className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
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
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the game..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical"
                />
              </div>

              {/* Age Recommendation */}
              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Age Recommendation *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ageOptions.map(opt => {
                    const isActive = formData.ageRecommendation === opt;
                    return (
                      <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, ageRecommendation: opt }))} className={`px-3 py-1 rounded-full text-xs font-arcade font-bold border transition-colors ${isActive ? 'bg-blue-500/20 text-blue-300 border-blue-500' : 'bg-void-700/30 text-neon-bright/80 border-neon-bright/30'}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  name="ageRecommendation"
                  value={formData.ageRecommendation}
                  onChange={handleInputChange}
                  placeholder="e.g., 8+, 12+, 18+"
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 font-arcade transition-all duration-300"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Tags (click to toggle) *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tagOptions.map(tag => {
                    const selected = new Set(parseTags(formData.tags)).has(tag);
                    return (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-arcade font-bold border transition-colors ${selected ? 'bg-neon-bright/20 text-neon-bright border-neon-bright' : 'bg-void-700/30 text-neon-bright/80 border-neon-bright/30'}`}>
                        #{tag}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="co-op, dice, cards, trivia"
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 font-arcade transition-all duration-300"
                />
              </div>

              {/* Copies in Shop */}
              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                  Copies in Shop *
                </label>
                <input
                  type="number"
                  name="copiesAvailable"
                  value={formData.copiesAvailable}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300"
                />
              </div>

              {/* For Sale & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="forSale"
                    checked={formData.forSale}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-neon-bright border-2 border-neon-bright rounded focus:ring-neon-glow"
                  />
                  <label className="text-void-800 dark:text-neon-bright font-arcade font-bold">
                    Game is for sale
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">
                    Price (SAR) {formData.forSale ? '*' : ''}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    disabled={!formData.forSale}
                    required={formData.forSale}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300 ${formData.forSale ? 'border-neon-bright' : 'border-void-500/50 opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Copies For Sale {formData.forSale ? '*' : ''}</label>
                  <input
                    type="number"
                    name="copiesForSale"
                    value={formData.copiesForSale}
                    onChange={handleInputChange}
                    min="0"
                    disabled={!formData.forSale}
                    required={formData.forSale}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300 ${formData.forSale ? 'border-neon-bright' : 'border-void-500/50 opacity-70'}`}
                  />
                </div>
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
        </ModalPortal>
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
                    {game.ageRecommendation && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500 rounded-full text-xs font-arcade font-bold">
                        {game.ageRecommendation}
                      </span>
                    )}
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

              {/* Tags and inventory */}
              <div className="mb-4 flex flex-wrap gap-2">
                {(game.tags || []).slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-void-700/40 text-neon-bright/90 border border-neon-bright/30 rounded-full text-xs font-arcade font-bold">
                    #{tag}
                  </span>
                ))}
                {typeof game.copiesAvailable === 'number' && (
                  <span className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500 rounded-full text-xs font-arcade font-bold">
                    🗃️ {game.copiesAvailable} copies
                  </span>
                )}
              </div>

              {/* For sale badge */}
              {game.forSale && (
                <div className="mb-4 px-3 py-2 bg-success-500/10 text-success-400 border border-success-500 rounded-xl font-arcade font-bold text-sm flex items-center justify-between">
                  <span>💸 For Sale{typeof game.price === 'number' ? `: ${game.price} SAR` : ''}</span>
                  {typeof game.copiesForSale === 'number' && (
                    <span className="px-2 py-1 bg-success-500/20 text-success-300 border border-success-500 rounded-full text-xs">{game.copiesForSale} copies</span>
                  )}
                </div>
              )}

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
                  onClick={() => openEdit(game)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                >
                  Edit
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

      {/* Edit Game Modal */}
      {editingGameId && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
            <div className="bg-[#0D0D1A] p-6 rounded-2xl shadow-lg w-full max-w-2xl mx-4 animate-fade-in max-h-[90vh] overflow-y-auto border-2 border-neon-bright">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">✏️</span>
                  <h3 className="text-2xl font-arcade font-black text-gold-bright">
                    Edit Game
                  </h3>
                </div>
                <button 
                  onClick={() => setEditingGameId(null)}
                  className="p-2 bg-light-200 dark:bg-void-800 hover:bg-light-300 dark:hover:bg-void-700 text-danger-400 rounded-lg transition-all duration-300 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Game Name *</label>
                    <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade" />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Category</label>
                    <select name="category" value={editFormData.category} onChange={handleEditInputChange} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300">
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Min Players</label>
                    <input type="number" name="minPlayers" value={editFormData.minPlayers} onChange={handleEditInputChange} min="1" max="20" required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Max Players</label>
                    <input type="number" name="maxPlayers" value={editFormData.maxPlayers} onChange={handleEditInputChange} min="1" max="20" required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Duration (minutes)</label>
                    <input type="number" name="duration" value={editFormData.duration} onChange={handleEditInputChange} min="5" max="480" required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Difficulty</label>
                    <select name="difficulty" value={editFormData.difficulty} onChange={handleEditInputChange} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300">
                      {difficulties.map(diff => (
                        <option key={diff.value} value={diff.value}>{diff.icon} {diff.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Description</label>
                  <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} rows={3} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 transition-all duration-300 font-arcade resize-vertical" />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Age Recommendation</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {ageOptions.map(opt => {
                      const isActive = editFormData.ageRecommendation === opt;
                      return (
                        <button key={opt} type="button" onClick={() => setEditFormData(prev => ({ ...prev, ageRecommendation: opt }))} className={`px-3 py-1 rounded-full text-xs font-arcade font-bold border transition-colors ${isActive ? 'bg-blue-500/20 text-blue-300 border-blue-500' : 'bg-void-700/30 text-neon-bright/80 border-neon-bright/30'}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <input type="text" name="ageRecommendation" value={editFormData.ageRecommendation} onChange={handleEditInputChange} placeholder="e.g., 8+, 12+, 18+" required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 font-arcade transition-all duration-300" />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Tags (click to toggle)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tagOptions.map(tag => {
                      const selected = new Set(parseTags(editFormData.tags)).has(tag);
                      return (
                        <button key={tag} type="button" onClick={() => toggleEditTag(tag)} className={`px-3 py-1 rounded-full text-xs font-arcade font-bold border transition-colors ${selected ? 'bg-neon-bright/20 text-neon-bright border-neon-bright' : 'bg-void-700/30 text-neon-bright/80 border-neon-bright/30'}`}>
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                  <input type="text" name="tags" value={editFormData.tags} onChange={handleEditInputChange} placeholder="co-op, dice, cards, trivia" required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white placeholder-void-600 dark:placeholder-neon-bright/60 font-arcade transition-all duration-300" />
                </div>

                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Copies Available</label>
                  <input type="number" name="copiesAvailable" value={editFormData.copiesAvailable} onChange={handleEditInputChange} min="0" required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" name="forSale" checked={editFormData.forSale} onChange={handleEditInputChange} className="w-5 h-5 text-neon-bright border-2 border-neon-bright rounded focus:ring-neon-glow" />
                    <label className="text-void-800 dark:text-neon-bright font-arcade font-bold">Game is for sale</label>
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Price (SAR)</label>
                    <input type="number" name="price" value={editFormData.price} onChange={handleEditInputChange} min="0" step="0.01" disabled={!editFormData.forSale} required={editFormData.forSale} className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300 ${editFormData.forSale ? 'border-neon-bright' : 'border-void-500/50 opacity-70'}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Copies For Sale</label>
                    <input type="number" name="copiesForSale" value={editFormData.copiesForSale} onChange={handleEditInputChange} min="0" disabled={!editFormData.forSale} required={editFormData.forSale} className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-neon-glow focus:border-transparent bg-light-200 dark:bg-void-800 text-void-900 dark:text-white font-arcade transition-all duration-300 ${editFormData.forSale ? 'border-neon-bright' : 'border-void-500/50 opacity-70'}`} />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setEditingGameId(null)} className="flex-1 px-4 py-3 bg-light-300 dark:bg-void-700 hover:bg-light-400 dark:hover:bg-void-600 text-void-800 dark:text-neon-bright font-arcade font-bold rounded-xl transition-all duration-300 border-2 border-light-400 dark:border-void-600 hover:border-neon-bright/50">CANCEL</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gold-bright hover:bg-gold-neon text-void-1000 font-arcade font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-gold-lg border-2 border-gold-bright">SAVE CHANGES</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

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
