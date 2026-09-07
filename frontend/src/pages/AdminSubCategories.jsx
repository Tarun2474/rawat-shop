// frontend/src/pages/AdminSubCategories.jsx (Ya Admin Dashboard ka ek section)
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, FolderPlus } from 'lucide-react';
import axios from 'axios';

export default function AdminSubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('adminToken');

  const fetchSubCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/subcategories`);
      if (data.success) setSubCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/subcategories`, { name: newCatName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setNewCatName('');
        fetchSubCategories();
        alert('Sub-category created successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sub-category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete sub-category "${name}"?`)) {
      try {
        await axios.delete(`${API_URL}/subcategories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubCategories(subCategories.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">
          CREATE <span className="text-red-500">SUB CATEGORIES</span>
        </h2>
        <p className="text-[var(--text-muted)] font-bold">Add new sub-categories dynamically. Duplicates are automatically blocked.</p>
      </div>

      {/* Create Form */}
      <div className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] shadow-xl">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Enter new sub-category name (e.g., Cyberpunk, GTA VI)..." 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full theme-input rounded-xl p-3.5 font-bold focus:outline-none focus:border-red-500 transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FolderPlus size={20} /> {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>

      {/* Existing Sub Categories List */}
      <div className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] shadow-xl">
        <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider mb-4">
          Existing Sub Categories ({subCategories.length})
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {subCategories.map(cat => (
            <div key={cat._id} className="glass flex items-center justify-between p-3 rounded-xl border border-[var(--glass-border)]">
              <span className="text-xs font-bold text-[var(--text-main)] truncate">{cat.name}</span>
              <button 
                onClick={() => handleDelete(cat._id, cat.name)}
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1 cursor-pointer"
                title="Delete Category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {subCategories.length === 0 && (
            <p className="col-span-full text-center text-[var(--text-muted)] py-6 text-xs font-bold">No custom sub-categories created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}