// frontend/src/pages/AdminManage.jsx

import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Download, Heart, XCircle, CheckSquare, Square, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const MAIN_CATEGORIES = ['Latest', 'Premium', 'Mobile Wallpapers', 'Laptop Wallpapers', 'Tablet Wallpapers'];
const SUB_CATEGORIES = ['Gods', 'Gaming', 'Anime', 'Nature', 'Cars', 'Bikes', 'Technology', 'Superheroes', 'Marvel', 'DC', 'Movies', 'Space', 'Abstract', 'Dark', 'AMOLED', 'Minimal', 'Sports', 'Fantasy', 'Sci-Fi'];

export default function AdminManage() {
  const [wallpapers, setWallpapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWp, setEditingWp] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null); // New image file state for replacement
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('adminToken');

  const fetchWallpapers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/wallpapers`);
      if (data.success) setWallpapers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const handleDelete = async (id, name) => {
    if(window.confirm(`Permanently delete "${name}" from Cloudinary and Database? This cannot be undone.`)) {
      try {
        await axios.delete(`${API_URL}/wallpapers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWallpapers(wallpapers.filter(w => w._id !== id));
      } catch (err) {
        alert("Failed to delete wallpaper");
      }
    }
  };

  // Toggle category handler inside Edit Modal
  const toggleEditMainCategory = (cat) => {
    let currentCats = Array.isArray(editingWp.mainCategory) ? editingWp.mainCategory : [editingWp.mainCategory];
    if (currentCats.includes(cat)) {
      if (currentCats.length > 1) {
        setEditingWp({ ...editingWp, mainCategory: currentCats.filter(c => c !== cat) });
      }
    } else {
      setEditingWp({ ...editingWp, mainCategory: [...currentCats, cat] });
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setEditingWp({ ...editingWp, url: URL.createObjectURL(file) }); // Show local preview
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editingWp.name);
      formData.append('mainCategory', JSON.stringify(editingWp.mainCategory));
      formData.append('category', editingWp.category);
      formData.append('views', editingWp.views || 0);
      formData.append('downloads', editingWp.downloads || 0);
      formData.append('likes', editingWp.likes || 0);
      formData.append('isCoverFlow', editingWp.isCoverFlow || false);

      // If user selected a new image file to replace the old one
      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      await axios.put(`${API_URL}/wallpapers/${editingWp._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchWallpapers();
      setEditingWp(null); // Close modal
      setNewImageFile(null);
    } catch(err) {
      alert("Failed to update wallpaper");
    }
  };

  const filtered = wallpapers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.wallpaperId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* EDIT MODAL */}
      {editingWp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 border border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.3)] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black brand-font text-[var(--text-main)]">EDIT <span className="text-red-500">{editingWp.wallpaperId}</span></h3>
               <button onClick={() => { setEditingWp(null); setNewImageFile(null); }} className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer"><XCircle size={28}/></button>
             </div>
             
             <form onSubmit={handleSaveEdit} className="space-y-4">
                
                {/* Change Wallpaper Image Preview & Upload Option */}
                <div>
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase mb-2 block">Wallpaper Asset Preview / Replace</label>
                  <div className="flex items-center gap-4 theme-input p-3 rounded-xl border border-[var(--glass-border)]">
                    <img src={editingWp.url} alt="Current" className="w-20 h-14 object-cover rounded-lg border border-neutral-700 shadow" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[var(--text-muted)] mb-2">Want to replace this image?</p>
                      <label className="bg-red-600/10 text-red-500 border border-red-500/50 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-red-600 hover:text-white transition-all inline-block">
                        Choose New File
                        <input type="file" className="hidden" accept="image/*" onChange={handleEditFileChange} />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase">Name</label>
                  <input type="text" value={editingWp.name} onChange={e => setEditingWp({...editingWp, name: e.target.value})} className="w-full theme-input rounded-lg p-3 font-bold mt-1" required />
                </div>
                
                {/* Manual Stats Editor Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase">Views</label>
                    <input type="number" value={editingWp.views || 0} onChange={e => setEditingWp({...editingWp, views: e.target.value})} className="w-full theme-input rounded-lg p-2.5 font-bold mt-1 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase">Downloads</label>
                    <input type="number" value={editingWp.downloads || 0} onChange={e => setEditingWp({...editingWp, downloads: e.target.value})} className="w-full theme-input rounded-lg p-2.5 font-bold mt-1 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase">Likes</label>
                    <input type="number" value={editingWp.likes || 0} onChange={e => setEditingWp({...editingWp, likes: e.target.value})} className="w-full theme-input rounded-lg p-2.5 font-bold mt-1 text-sm" />
                  </div>
                </div>

                {/* Multi-Select Checkboxes for Main Categories */}
                <div>
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase mb-2 block">Main Categories (Select Multiple)</label>
                  <div className="grid grid-cols-2 gap-2 glass p-3 rounded-xl border border-[var(--glass-border)] max-h-36 overflow-y-auto">
                    {MAIN_CATEGORIES.map(c => {
                      const currentCats = Array.isArray(editingWp.mainCategory) ? editingWp.mainCategory : [editingWp.mainCategory];
                      const isSelected = currentCats.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleEditMainCategory(c)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                            isSelected 
                              ? 'bg-red-600 text-white shadow-sm' 
                              : 'theme-input text-[var(--text-muted)] hover:text-[var(--text-main)]'
                          }`}
                        >
                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          <span className="truncate">{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase">Sub Category (Includes Gods)</label>
                  <select value={editingWp.category} onChange={e => setEditingWp({...editingWp, category: e.target.value})} className="w-full theme-input rounded-lg p-3 font-bold mt-1 cursor-pointer">
                    {SUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Cover Flow Checkbox in Edit Modal */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingWp({ ...editingWp, isCoverFlow: !editingWp.isCoverFlow })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all border cursor-pointer w-full ${
                      editingWp.isCoverFlow 
                        ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                        : 'theme-input text-[var(--text-muted)] border-[var(--glass-border)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {editingWp.isCoverFlow ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span className="uppercase tracking-wider">Show in Homepage Cover Flow Carousel</span>
                  </button>
                </div>
                
                <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-lg mt-4 uppercase tracking-widest hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer">
                  Save Changes to Database
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">DATABASE <span className="text-red-500">RECORDS</span></h2>
          <p className="text-[var(--text-muted)] font-bold">Manage wallpapers, cover flow items, and view full upload history.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full theme-input rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-red-500 transition-all font-bold" />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--input-bg)]">
                <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Asset Preview</th>
                <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Metadata</th>
                <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">History Logs & Likes</th>
                <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-[var(--text-main)] font-bold">Loading Database...</td></tr>
              ) : filtered.map(wp => (
                <tr key={wp._id} className="hover:bg-[var(--input-bgy)] transition-colors group">
                  <td className="p-5 w-24">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-[var(--glass-border)] group-hover:border-red-500/50 shadow-md relative">
                      <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" loading="lazy"/>
                      {wp.isCoverFlow && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          CF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-sm text-[var(--text-main)]">{wp.name}</span>
                      <span className="text-red-500 font-black brand-font text-xs tracking-wider">{wp.wallpaperId}</span>
                      <div className="flex gap-2 mt-1 flex-wrap max-w-xs">
                        {Array.isArray(wp.mainCategory) ? wp.mainCategory.map(cat => (
                          <span key={cat} className="text-[10px] theme-input px-2 py-0.5 rounded uppercase font-bold border border-[var(--glass-border)] text-[var(--text-main)]">{cat}</span>
                        )) : (
                          <span className="text-[10px] theme-input px-2 py-0.5 rounded uppercase font-bold border border-[var(--glass-border)] text-[var(--text-main)]">{wp.mainCategory}</span>
                        )}
                        <span className="text-[10px] theme-input px-2 py-0.5 rounded uppercase font-bold border border-[var(--glass-border)] bg-red-600/10 text-red-500">{wp.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1 text-xs font-bold text-[var(--text-muted)]">
                      <span className="text-[var(--text-main)]">Uploaded: {new Date(wp.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-4 mt-1">
                         <span className="flex items-center gap-1 text-blue-500"><Eye size={12}/> {wp.views || 0}</span>
                         <span className="flex items-center gap-1 text-green-500"><Download size={12}/> {wp.downloads || 0}</span>
                         <span className="flex items-center gap-1 text-red-500"><Heart size={12} className="fill-current"/> {wp.likes || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setEditingWp(wp)} className="p-2.5 theme-input hover:bg-blue-600 hover:text-white text-[var(--text-main)] rounded-lg transition-colors border border-[var(--glass-border)] cursor-pointer" title="Edit Stats & Details">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(wp._id, wp.name)} className="p-2.5 theme-input hover:bg-red-600 hover:text-white text-[var(--text-main)] rounded-lg transition-colors border border-[var(--glass-border)] shadow-none hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] cursor-pointer" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="4" className="p-10 text-center text-[var(--text-muted)] font-bold">No assets found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}