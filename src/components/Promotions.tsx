import React, { useState } from 'react';
import ModalPortal from './ModalPortal';
import { Promotion } from '../types';

interface PromotionsProps {
  promotions: Promotion[];
  onAddPromotion: (p: Omit<Promotion, 'id' | 'createdAt'>) => void;
  onUpdatePromotion: (id: string, updates: Partial<Promotion>) => void;
  onDeletePromotion?: (id: string) => void;
}

const Promotions: React.FC<PromotionsProps> = ({ promotions, onAddPromotion, onUpdatePromotion, onDeletePromotion }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    name: '',
    firstHourPrice: 30,
    extraHourPrice: 30,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : type === 'checkbox' ? checked : value
    }));
  };

  const addPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Name is required'); return; }
    onAddPromotion({
      name: form.name.trim(),
      firstHourPrice: Number(form.firstHourPrice) || 0,
      extraHourPrice: Number(form.extraHourPrice) || 0,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined
    });
    setForm({ name: '', firstHourPrice: 30, extraHourPrice: 30, isActive: true, startDate: '', endDate: '' });
    setShowAdd(false);
  };

  const openEdit = (promo: Promotion) => {
    setEditing(promo);
    setForm({
      name: promo.name,
      firstHourPrice: promo.firstHourPrice,
      extraHourPrice: promo.extraHourPrice,
      isActive: promo.isActive,
      startDate: promo.startDate || '',
      endDate: promo.endDate || ''
    });
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    onUpdatePromotion(editing.id, {
      name: form.name.trim(),
      firstHourPrice: Number(form.firstHourPrice) || 0,
      extraHourPrice: Number(form.extraHourPrice) || 0,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined
    });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-arcade font-black text-gold-bright">Promotions</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl border-2 border-neon-bright">ADD PROMO</button>
      </div>

      {showAdd && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
            <div className="bg-[#0D0D1A] p-6 rounded-2xl shadow-lg w-full max-w-lg mx-4 animate-fade-in border-2 border-neon-bright">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-arcade font-black text-gold-bright">Add Promotion</h4>
              <button onClick={() => setShowAdd(false)} className="p-2 bg-void-800 hover:bg-void-700 text-danger-400 rounded-lg">✕</button>
            </div>
            <form onSubmit={addPromo} className="space-y-4">
              <div>
                <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Name *</label>
                <input name="name" value={form.name} onChange={handleInput} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">First Hour Price *</label>
                  <input name="firstHourPrice" type="number" min="0" step="0.01" value={form.firstHourPrice} onChange={handleInput} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Extra Hour Price *</label>
                  <input name="extraHourPrice" type="number" min="0" step="0.01" value={form.extraHourPrice} onChange={handleInput} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Start Date</label>
                  <input name="startDate" type="date" value={form.startDate} onChange={handleInput} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">End Date</label>
                  <input name="endDate" type="date" value={form.endDate} onChange={handleInput} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleInput} className="w-5 h-5 text-neon-bright border-2 border-neon-bright rounded" />
                <label className="text-neon-bright font-arcade font-bold">Active</label>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 bg-void-700 hover:bg-void-600 text-neon-bright font-arcade font-bold rounded-xl border-2 border-void-600">CANCEL</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-neon-bright hover:bg-neon-glow text-void-1000 font-arcade font-black rounded-xl border-2 border-neon-bright">ADD PROMO</button>
              </div>
            </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {editing && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
            <div className="bg-[#0D0D1A] p-6 rounded-2xl shadow-lg w-full max-w-lg mx-4 animate-fade-in border-2 border-neon-bright">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-arcade font-black text-gold-bright">Edit Promotion</h4>
                <button onClick={() => setEditing(null)} className="p-2 bg-void-800 hover:bg-void-700 text-danger-400 rounded-lg">✕</button>
              </div>
              <form onSubmit={saveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Name *</label>
                  <input name="name" value={form.name} onChange={handleInput} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">First Hour Price *</label>
                    <input name="firstHourPrice" type="number" min="0" step="0.01" value={form.firstHourPrice} onChange={handleInput} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Extra Hour Price *</label>
                    <input name="extraHourPrice" type="number" min="0" step="0.01" value={form.extraHourPrice} onChange={handleInput} required className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">Start Date</label>
                    <input name="startDate" type="date" value={form.startDate} onChange={handleInput} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-arcade font-bold text-gold-bright mb-2">End Date</label>
                    <input name="endDate" type="date" value={form.endDate} onChange={handleInput} className="w-full px-4 py-3 border-2 border-neon-bright rounded-xl bg-void-800 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleInput} className="w-5 h-5 text-neon-bright border-2 border-neon-bright rounded" />
                  <label className="text-neon-bright font-arcade font-bold">Active</label>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 px-4 py-3 bg-void-700 hover:bg-void-600 text-neon-bright font-arcade font-bold rounded-xl border-2 border-void-600">CANCEL</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gold-bright hover:bg-gold-neon text-void-1000 font-arcade font-black rounded-xl border-2 border-gold-bright">SAVE</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      <div className="bg-void-900/90 backdrop-blur-md rounded-3xl border-2 border-neon-bright p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="p-4 rounded-xl border-2 border-neon-bright/40 bg-void-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-arcade font-bold text-gold-bright text-lg">{promo.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-arcade font-bold ${promo.isActive ? 'bg-success-500/20 text-success-400 border border-success-500' : 'bg-void-700 text-void-300 border border-void-600'}`}>{promo.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-neon-bright/80 font-arcade text-sm">First hour: {promo.firstHourPrice} SAR • Extra hour: {promo.extraHourPrice} SAR</div>
              {(promo.startDate || promo.endDate) && (
                <div className="text-neon-bright/60 font-arcade text-xs mt-1">Valid {promo.startDate ? `from ${promo.startDate}` : ''} {promo.endDate ? `to ${promo.endDate}` : ''}</div>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => onUpdatePromotion(promo.id, { isActive: !promo.isActive })} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-arcade font-bold">{promo.isActive ? 'Disable' : 'Activate'}</button>
                <button onClick={() => openEdit(promo)} className="px-3 py-2 bg-neon-bright hover:bg-neon-glow text-void-1000 rounded-lg text-xs font-arcade font-bold">Edit</button>
                {onDeletePromotion && (
                  <button onClick={() => onDeletePromotion(promo.id)} className="px-3 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg text-xs font-arcade font-bold">Delete</button>
                )}
              </div>
            </div>
          ))}
          {promotions.length === 0 && (
            <div className="text-center text-neon-bright/70 font-arcade">No promotions yet</div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Promotions;


